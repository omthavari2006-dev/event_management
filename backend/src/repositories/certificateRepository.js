const { executeQuery, executeWriteTransaction } = require('../config/db');
const { recordsToObjects } = require('../utils/neo4jUtils');
const { v4: uuidv4 } = require('uuid');

class CertificateRepository {
  /**
   * Generates certificates for all attendees of an event
   * Sets type to 'Winner' if (s)-[:WON]->(e), else 'Participation'
   * ID is deterministic: eventId + '_' + studentId
   */
  async generateCertificatesForEvent(eventId) {
    return executeWriteTransaction(async (tx) => {
      // Find attendees and check if they won
      const findAttendeesQuery = `
        MATCH (s:Student)-[:ATTENDED]->(e:Event {eventId: $eventId})
        OPTIONAL MATCH (s)-[w:WON]->(e)
        RETURN s.studentId AS studentId,
               s.name AS studentName,
               s.email AS email,
               e.name AS eventName,
               w.position AS position,
               w.prize AS prize
      `;
      const attRes = await tx.run(findAttendeesQuery, { eventId });
      const attendees = recordsToObjects(attRes.records);

      if (attendees.length === 0) {
        throw new Error('No attendees found for this event to issue certificates.');
      }

      const generatedList = [];

      for (const att of attendees) {
        const certId = `${eventId}_${att.studentId}`;
        const isWinner = att.position !== null && att.position !== undefined;
        const certType = isWinner ? 'Winner' : 'Participation';
        const verifyCode = `VERIFY-${isWinner ? 'WIN' : 'PAR'}-${uuidv4().substring(0, 6).toUpperCase()}`;
        const fileUrl = `/api/certificates/${certId}/download`;

        const certQuery = `
          MATCH (e:Event {eventId: $eventId}), (s:Student {studentId: $studentId})
          MERGE (cert:Certificate {certificateId: $certId})
          ON CREATE SET
            cert.type = $certType,
            cert.verificationCode = $verifyCode,
            cert.fileUrl = $fileUrl,
            cert.issueDate = toString(date())
          MERGE (e)-[:ISSUES]->(cert)
          MERGE (cert)-[:AWARDED_TO]->(s)
          RETURN cert.certificateId AS certificateId,
                 cert.type AS type,
                 cert.verificationCode AS verificationCode,
                 cert.issueDate AS issueDate,
                 s.name AS studentName,
                 e.name AS eventName
        `;

        const certRes = await tx.run(certQuery, {
          eventId,
          studentId: att.studentId,
          certId,
          certType,
          verifyCode,
          fileUrl
        });
        generatedList.push(recordsToObjects(certRes.records)[0]);
      }

      return generatedList;
    });
  }

  async getEventAttendeesWithCertificates(eventId) {
    const cypher = `
      MATCH (s:Student)-[att:ATTENDED]->(e:Event {eventId: $eventId})
      OPTIONAL MATCH (e)-[:ISSUES]->(cert:Certificate)-[:AWARDED_TO]->(s)
      OPTIONAL MATCH (s)-[w:WON]->(e)
      RETURN s.studentId AS studentId,
             s.name AS studentName,
             s.email AS email,
             s.department AS department,
             s.year AS year,
             att.timeMarked AS attendedAt,
             cert.certificateId AS certificateId,
             cert.type AS certificateType,
             cert.fileUrl AS fileUrl,
             cert.fileName AS fileName,
             cert.fileType AS fileType,
             cert.hasCustomFile AS hasCustomFile,
             cert.issueDate AS certificateIssueDate,
             cert.verificationCode AS verificationCode,
             w.position AS wonPosition,
             w.prize AS wonPrize
      ORDER BY att.timeMarked ASC
    `;
    const result = await executeQuery(cypher, { eventId });
    return recordsToObjects(result.records);
  }

  async saveCustomCertificate({ eventId, studentId, certType, fileUrl, fileName, fileType, verifyCode }) {
    const certId = `${eventId}_${studentId}`;
    const cypher = `
      MATCH (e:Event {eventId: $eventId}), (s:Student {studentId: $studentId})
      MERGE (cert:Certificate {certificateId: $certId})
      SET cert.type = $certType,
          cert.verificationCode = coalesce(cert.verificationCode, $verifyCode),
          cert.fileUrl = $fileUrl,
          cert.fileName = $fileName,
          cert.fileType = $fileType,
          cert.hasCustomFile = true,
          cert.issueDate = toString(date())
      MERGE (e)-[:ISSUES]->(cert)
      MERGE (cert)-[:AWARDED_TO]->(s)
      RETURN cert.certificateId AS certificateId,
             cert.type AS type,
             cert.verificationCode AS verificationCode,
             cert.fileUrl AS fileUrl,
             cert.fileName AS fileName,
             cert.fileType AS fileType,
             cert.hasCustomFile AS hasCustomFile,
             cert.issueDate AS issueDate,
             s.name AS studentName,
             s.studentId AS studentId,
             e.name AS eventName
    `;
    const result = await executeQuery(cypher, {
      eventId,
      studentId,
      certId,
      certType,
      fileUrl,
      fileName,
      fileType,
      verifyCode
    });
    const records = recordsToObjects(result.records);
    return records[0];
  }

  async getCertificatesByStudent(studentId) {
    const cypher = `
      MATCH (s:Student {studentId: $studentId})<-[:AWARDED_TO]-(cert:Certificate)<-[:ISSUES]-(e:Event)
      OPTIONAL MATCH (c:Club)-[:ORGANIZES]->(e)
      OPTIONAL MATCH (s)-[w:WON]->(e)
      RETURN cert.certificateId AS certificateId,
             cert.type AS type,
             cert.verificationCode AS verificationCode,
             cert.fileUrl AS fileUrl,
             cert.fileName AS fileName,
             cert.fileType AS fileType,
             cert.hasCustomFile AS hasCustomFile,
             cert.issueDate AS issueDate,
             e.eventId AS eventId,
             e.name AS eventName,
             e.type AS eventType,
             c.name AS clubName,
             w.position AS wonPosition,
             w.prize AS wonPrize
      ORDER BY cert.issueDate DESC
    `;
    const result = await executeQuery(cypher, { studentId });
    return recordsToObjects(result.records);
  }

  async verifyCertificateByCode(code) {
    const cypher = `
      MATCH (cert:Certificate {verificationCode: $code})
      MATCH (cert)-[:AWARDED_TO]->(s:Student)
      MATCH (e:Event)-[:ISSUES]->(cert)
      OPTIONAL MATCH (c:Club)-[:ORGANIZES]->(e)
      OPTIONAL MATCH (s)-[w:WON]->(e)
      RETURN cert.certificateId AS certificateId,
             cert.type AS type,
             cert.verificationCode AS verificationCode,
             cert.issueDate AS issueDate,
             cert.fileUrl AS fileUrl,
             cert.fileName AS fileName,
             cert.fileType AS fileType,
             cert.hasCustomFile AS hasCustomFile,
             s.name AS studentName,
             s.studentId AS studentId,
             s.department AS department,
             e.name AS eventName,
             e.eventId AS eventId,
             e.venue AS venue,
             c.name AS clubName,
             w.position AS position,
             w.prize AS prize
    `;
    const result = await executeQuery(cypher, { code });
    const records = recordsToObjects(result.records);
    return records[0] || null;
  }

  async getCertificateById(certificateId) {
    const cypher = `
      MATCH (cert:Certificate {certificateId: $certificateId})
      MATCH (cert)-[:AWARDED_TO]->(s:Student)
      MATCH (e:Event)-[:ISSUES]->(cert)
      OPTIONAL MATCH (c:Club)-[:ORGANIZES]->(e)
      OPTIONAL MATCH (s)-[w:WON]->(e)
      RETURN cert.certificateId AS certificateId,
             cert.type AS type,
             cert.verificationCode AS verificationCode,
             cert.issueDate AS issueDate,
             cert.fileUrl AS fileUrl,
             cert.fileName AS fileName,
             cert.fileType AS fileType,
             cert.hasCustomFile AS hasCustomFile,
             s.name AS studentName,
             s.studentId AS studentId,
             s.department AS department,
             e.name AS eventName,
             e.eventId AS eventId,
             c.name AS clubName,
             w.position AS position,
             w.prize AS prize
    `;
    const result = await executeQuery(cypher, { certificateId });
    const records = recordsToObjects(result.records);
    return records[0] || null;
  }
}

module.exports = new CertificateRepository();
