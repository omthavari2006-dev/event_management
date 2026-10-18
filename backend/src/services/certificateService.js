const certificateRepository = require('../repositories/certificateRepository');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

class CertificateService {
  async generateCertificates(eventId) {
    return certificateRepository.generateCertificatesForEvent(eventId);
  }

  async getStudentCertificates(studentId) {
    return certificateRepository.getCertificatesByStudent(studentId);
  }

  async verifyCertificate(code) {
    const cert = await certificateRepository.verifyCertificateByCode(code);
    if (!cert) {
      throw new Error('Certificate not found or verification code is invalid.');
    }
    return cert;
  }

  async generateCertificatePdf(certificateId) {
    const cert = await certificateRepository.getCertificateById(certificateId);
    if (!cert) {
      throw new Error('Certificate not found.');
    }

    // Generate QR code for verification link
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify?code=${cert.verificationCode}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 140 });
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Certificate Border
      doc.rect(20, 20, 802, 555)
        .lineWidth(3)
        .strokeColor('#1e293b')
        .stroke();

      doc.rect(26, 26, 790, 543)
        .lineWidth(1)
        .strokeColor('#3b82f6')
        .stroke();

      // Certificate Header
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('CAMPUS EVENT MANAGEMENT SYSTEM', 40, 70, { align: 'center' });

      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('OFFICIAL MERIT RECOGNITION', { align: 'center' });

      doc.moveDown(1.2);

      const title = cert.type === 'Winner' ? 'CERTIFICATE OF EXCELLENCE' : 'CERTIFICATE OF PARTICIPATION';
      const titleColor = cert.type === 'Winner' ? '#b45309' : '#1d4ed8';

      doc.fontSize(22)
        .font('Helvetica-Bold')
        .fillColor(titleColor)
        .text(title, { align: 'center' });

      doc.moveDown(0.8);

      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#334155')
        .text('This is proudly presented to:', { align: 'center' });

      doc.moveDown(0.5);

      // Recipient Name
      doc.fontSize(26)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(cert.studentName, { align: 'center' });

      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`Department: ${cert.department || 'Campus Student'}`, { align: 'center' });

      doc.moveDown(0.8);

      // Event details
      const description = cert.type === 'Winner'
        ? `For securing Position #${cert.position} (${cert.prize || 'Winner Prize'}) in "${cert.eventName}" hosted by ${cert.clubName || 'Campus Clubs'}.`
        : `For active and enthusiastic participation in "${cert.eventName}" organized by ${cert.clubName || 'Campus Clubs'}.`;

      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#334155')
        .text(description, 100, doc.y, { align: 'center', width: 642 });

      // Verification QR Code & Code details
      doc.image(qrBuffer, 650, 400, { width: 100 });
      doc.fontSize(9)
        .fillColor('#475569')
        .text('Scan to Verify Online', 645, 510, { width: 110, align: 'center' });

      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(`Verification Code: ${cert.verificationCode}`, 60, 470);

      doc.font('Helvetica')
        .fillColor('#64748b')
        .text(`Issued On: ${cert.issueDate}`, 60, 488);

      doc.text('Powered by Neo4j Graph Database Verification', 60, 504);

      // Signatures
      doc.strokeColor('#94a3b8').lineWidth(1)
        .moveTo(350, 490).lineTo(520, 490).stroke();
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a')
        .text('Dean of Student Affairs', 350, 500, { width: 170, align: 'center' });

      doc.end();
    });
  }
}

module.exports = new CertificateService();
