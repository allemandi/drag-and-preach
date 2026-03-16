import { describe, it, expect, vi } from 'vitest';
import { formatOutline, generateId } from '@/lib/utils';
import { Section } from '@/lib/types';

describe('utils', () => {
  describe('generateId', () => {
    it('should generate a string ID', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatOutline', () => {
    const mockSections: Section[] = [
      {
        id: '1',
        title: 'Introduction',
        defaultTitle: 'Introduction',
        type: 'intro',
        blocks: [
          {
            id: 'b1',
            label: 'Hook',
            defaultLabel: 'Hook',
            placeholder: 'Hook placeholder',
            content: 'Hook content',
            type: 'intro',
          }
        ]
      }
    ];

    it('should format as markdown', () => {
      const result = formatOutline(mockSections, 'md');
      expect(result).toContain('# Sermon Outline');
      expect(result).toContain('## Introduction');
      expect(result).toContain('### Hook');
      expect(result).toContain('Hook content');
    });

    it('should format as text', () => {
      const result = formatOutline(mockSections, 'txt');
      expect(result).toContain('Introduction');
      expect(result).toContain('Hook');
      expect(result).toContain('Hook content');
    });

    it('should use placeholder if content is empty', () => {
        const emptySections: Section[] = [
            {
              id: '1',
              title: 'Introduction',
              defaultTitle: 'Introduction',
              type: 'intro',
              blocks: [
                {
                  id: 'b1',
                  label: 'Hook',
                  defaultLabel: 'Hook',
                  placeholder: 'Hook placeholder',
                  content: '',
                  type: 'intro',
                }
              ]
            }
          ];
        const result = formatOutline(emptySections, 'md');
        expect(result).toContain('*Hook placeholder*');
    });
  });
});
