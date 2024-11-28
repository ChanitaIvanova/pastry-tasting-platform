const request = require('supertest');
const app = require('../index');
const { createTestUser, generateTestToken } = require('./helpers/auth');
const ActivityLog = require('../models/ActivityLog');
const Questionnaire = require('../models/Questionnaire');

describe('Activity Logs API', () => {
  let adminUser, clientUser, adminToken, clientToken, testQuestionnaire;

  beforeEach(async () => {
    adminUser = await createTestUser('admin');
    clientUser = await createTestUser('client');
    adminToken = generateTestToken(adminUser);
    clientToken = generateTestToken(clientUser);

    testQuestionnaire = await Questionnaire.create({
      title: 'Test Questionnaire',
      createdBy: adminUser._id,
      brands: [{ name: 'Brand 1' }],
      status: 'open'
    });

    // Create some test activity logs
    await ActivityLog.create([
      {
        user: adminUser._id,
        action: 'CREATE_QUESTIONNAIRE',
        entityType: 'QUESTIONNAIRE',
        entityId: testQuestionnaire._id,
        details: { title: 'Test Questionnaire' }
      },
      {
        user: clientUser._id,
        action: 'VIEW_QUESTIONNAIRE',
        entityType: 'QUESTIONNAIRE',
        entityId: testQuestionnaire._id
      }
    ]);
  });

  describe('GET /api/activity-logs', () => {
    it('allows admin to view all activity logs', async () => {
      const response = await request(app)
        .get('/api/activity-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.logs).toHaveLength(2);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('pages');
    });

    it('denies access to non-admin users', async () => {
      const response = await request(app)
        .get('/api/activity-logs')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
    });

    it('supports filtering by action type', async () => {
      const response = await request(app)
        .get('/api/activity-logs?action=CREATE_QUESTIONNAIRE')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.logs).toHaveLength(1);
      expect(response.body.logs[0].action).toBe('CREATE_QUESTIONNAIRE');
    });
  });

  describe('GET /api/activity-logs/my-activities', () => {
    it('allows users to view their own activity logs', async () => {
      const response = await request(app)
        .get('/api/activity-logs/my-activities')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.logs).toHaveLength(1);
      expect(response.body.logs[0].user).toBe(clientUser._id.toString());
    });

    it('paginates results correctly', async () => {
      // Create additional logs
      await ActivityLog.create([
        {
          user: clientUser._id,
          action: 'VIEW_STATISTICS',
          entityType: 'QUESTIONNAIRE',
          entityId: testQuestionnaire._id
        },
        {
          user: clientUser._id,
          action: 'SUBMIT_RESPONSE',
          entityType: 'RESPONSE',
          entityId: testQuestionnaire._id
        }
      ]);

      const response = await request(app)
        .get('/api/activity-logs/my-activities?page=1&limit=2')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.logs).toHaveLength(2);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.total).toBe(3);
    });
  });
}); 