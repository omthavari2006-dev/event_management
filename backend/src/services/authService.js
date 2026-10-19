const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/tokenHelper');

class AuthService {
  async registerStudent({ name, email, phone, department, year, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const studentId = `stud-${uuidv4().substring(0, 6)}`;

    const newStudent = await userRepository.createStudent({
      studentId,
      name,
      email,
      phone,
      department,
      year,
      passwordHash
    });

    const token = generateToken({
      id: studentId,
      email,
      role: 'Student'
    });

    return {
      user: {
        id: studentId,
        name,
        email,
        department,
        year,
        role: 'Student'
      },
      token
    };
  }

  async registerOrganizer({ name, email, phone, department, year, password, clubId, clubName }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const studentId = `stud-${uuidv4().substring(0, 6)}`;

    await userRepository.createStudent({
      studentId,
      name,
      email,
      phone,
      department: department || 'Engineering',
      year: year || 3,
      passwordHash
    });

    const linkedClub = await userRepository.linkPresident({
      studentId,
      clubId,
      clubName: clubName || 'Student Club'
    });

    const token = generateToken({
      id: studentId,
      email,
      role: 'Student'
    });

    return {
      user: {
        id: studentId,
        name,
        email,
        department: department || 'Engineering',
        year: year || 3,
        points: 0,
        role: 'Student',
        clubMemberships: [{ clubId: linkedClub?.clubId, clubName: linkedClub?.clubName, role: 'President' }],
        presidentClubs: [linkedClub?.clubId].filter(Boolean)
      },
      token
    };
  }

  async registerAdmin({ name, email, title, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const adminId = `admin-${uuidv4().substring(0, 6)}`;

    await userRepository.createAdmin({
      adminId,
      name,
      email,
      title: title || 'Campus Administrator',
      passwordHash
    });

    const token = generateToken({
      id: adminId,
      email,
      role: 'Admin'
    });

    return {
      user: {
        id: adminId,
        name,
        email,
        role: 'Admin',
        title: title || 'Campus Administrator'
      },
      token
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('No account found with this email. If you are new, please register first.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Incorrect password. Please verify your credentials.');
      err.statusCode = 401;
      throw err;
    }

    const id = user.adminId || user.studentId;
    const token = generateToken({
      id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        points: user.points || 0,
        clubMemberships: user.clubMemberships || [],
        presidentClubs: user.presidentClubs || []
      },
      token
    };
  }

  async getCurrentUser(id, role) {
    if (role === 'Student') {
      return userRepository.getStudentProfile(id);
    }
    const cypher = `MATCH (a:Admin {adminId: $id}) RETURN a.adminId AS id, a.name AS name, a.email AS email, 'Admin' AS role`;
    const { executeQuery } = require('../config/db');
    const { recordsToObjects } = require('../utils/neo4jUtils');
    const result = await executeQuery(cypher, { id });
    return recordsToObjects(result.records)[0];
  }
}

module.exports = new AuthService();
