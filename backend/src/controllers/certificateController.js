const certificateService = require('../services/certificateService');
const asyncHandler = require('../utils/asyncHandler');

const generateCertificates = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const certificates = await certificateService.generateCertificates(eventId);
  res.status(200).json({
    success: true,
    count: certificates.length,
    certificates,
    message: 'Certificates generated successfully for all attendees.'
  });
});

const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.getStudentCertificates(req.user.id);
  res.status(200).json({ success: true, count: certificates.length, certificates });
});

const verifyCertificate = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Verification code is required.' });
  }
  const certificate = await certificateService.verifyCertificate(code);
  res.status(200).json({ success: true, certificate, valid: true });
});

const downloadCertificatePdf = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;
  const pdfBuffer = await certificateService.generateCertificatePdf(certificateId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="certificate-${certificateId}.pdf"`);
  res.send(pdfBuffer);
});

module.exports = {
  generateCertificates,
  getMyCertificates,
  verifyCertificate,
  downloadCertificatePdf
};
