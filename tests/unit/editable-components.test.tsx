import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EditableField } from '@/components/ui/editable-field';
import { EditableArea } from '@/components/ui/editable-area';

describe('EditableField', () => {
  it('renders trigger button with value and label', () => {
    render(<EditableField value="Sermon Title" onSave={vi.fn()} label="sermon title" id="test-field" />);
    const button = screen.getByRole('button', { name: /edit sermon title: sermon title/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Sermon Title');
  });

  it('enters editing mode on click and saves on Enter', () => {
    const handleSave = vi.fn();
    render(<EditableField value="Old Title" onSave={handleSave} label="sermon title" id="test-field" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Old Title');

    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSave).toHaveBeenCalledWith('New Title');
  });

  it('cancels edit and does not call onSave when Escape is pressed', () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();
    render(
      <EditableField
        value="Original Title"
        onSave={handleSave}
        onCancel={handleCancel}
        label="sermon title"
        id="test-field"
      />
    );

    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Changed Title' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(handleCancel).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('restores focus to trigger button on exit', () => {
    render(<EditableField value="Title" onSave={vi.fn()} label="sermon title" id="test-field" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    const returnedButton = screen.getByRole('button');
    expect(document.activeElement).toBe(returnedButton);
  });
});

describe('EditableArea', () => {
  it('renders trigger button with value or placeholder', () => {
    render(
      <EditableArea
        value=""
        placeholder="Type notes here..."
        onSave={vi.fn()}
        label="block content"
        id="test-area"
      />
    );
    const button = screen.getByRole('button', { name: /add block content/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Type notes here...');
  });

  it('saves content on Ctrl+Enter', () => {
    const handleSave = vi.fn();
    render(
      <EditableArea
        value="Initial Content"
        onSave={handleSave}
        label="block content"
        id="test-area"
      />
    );

    fireEvent.click(screen.getByRole('button'));
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'Updated Content\nLine 2' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    expect(handleSave).toHaveBeenCalledWith('Updated Content\nLine 2');
  });

  it('cancels edit on Escape without calling onSave', () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();
    render(
      <EditableArea
        value="Initial Content"
        onSave={handleSave}
        onCancel={handleCancel}
        label="block content"
        id="test-area"
      />
    );

    fireEvent.click(screen.getByRole('button'));
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'Some modified text' } });
    fireEvent.keyDown(textarea, { key: 'Escape' });

    expect(handleCancel).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('restores focus to trigger button on exit', () => {
    render(
      <EditableArea
        value="Some text"
        onSave={vi.fn()}
        label="block content"
        id="test-area"
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Escape' });

    const returnedButton = screen.getByRole('button');
    expect(document.activeElement).toBe(returnedButton);
  });
});
