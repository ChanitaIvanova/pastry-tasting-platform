import { sortQuestionnaires } from '../sorting';

describe('Sorting Utilities', () => {
  const mockQuestionnaires = [
    {
      _id: '1',
      title: 'Beta Test',
      status: 'open',
      responseCount: 5,
      createdAt: '2023-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Alpha Test',
      status: 'closed',
      responseCount: 10,
      createdAt: '2023-01-02T00:00:00.000Z'
    }
  ];

  it('should sort by title ascending', () => {
    const sorted = sortQuestionnaires([...mockQuestionnaires], 'title', 'asc');
    expect(sorted[0].title).toBe('Alpha Test');
    expect(sorted[1].title).toBe('Beta Test');
  });

  it('should sort by title descending', () => {
    const sorted = sortQuestionnaires([...mockQuestionnaires], 'title', 'desc');
    expect(sorted[0].title).toBe('Beta Test');
    expect(sorted[1].title).toBe('Alpha Test');
  });

  it('should sort by status', () => {
    const sorted = sortQuestionnaires([...mockQuestionnaires], 'status', 'asc');
    expect(sorted[0].status).toBe('closed');
    expect(sorted[1].status).toBe('open');
  });

  it('should sort by response count', () => {
    const sorted = sortQuestionnaires([...mockQuestionnaires], 'responses', 'desc');
    expect(sorted[0].responseCount).toBe(10);
    expect(sorted[1].responseCount).toBe(5);
  });

  it('should sort by creation date by default', () => {
    const sorted = sortQuestionnaires([...mockQuestionnaires]);
    expect(new Date(sorted[0].createdAt)).toBeGreaterThan(new Date(sorted[1].createdAt));
  });
}); 