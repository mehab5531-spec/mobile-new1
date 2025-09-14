import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const MarkdownRenderer = ({ content }) => {
  const { colors } = useTheme();

  const parseMarkdown = (text) => {
    const lines = (text || '').split('\n');
    const elements = [];
    let currentParagraph = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '') {
        if (currentParagraph) {
          elements.push({
            type: 'paragraph',
            content: currentParagraph.trim(),
            key: `p-${i}`,
          });
          currentParagraph = '';
        }
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        if (currentParagraph) {
          elements.push({
            type: 'paragraph',
            content: currentParagraph.trim(),
            key: `p-${i}`,
          });
          currentParagraph = '';
        }
        elements.push({
          type: 'h1',
          content: line.substring(2),
          key: `h1-${i}`,
        });
      } else if (line.startsWith('## ')) {
        if (currentParagraph) {
          elements.push({
            type: 'paragraph',
            content: currentParagraph.trim(),
            key: `p-${i}`,
          });
          currentParagraph = '';
        }
        elements.push({
          type: 'h2',
          content: line.substring(3),
          key: `h2-${i}`,
        });
      } else if (line.startsWith('### ')) {
        if (currentParagraph) {
          elements.push({
            type: 'paragraph',
            content: currentParagraph.trim(),
            key: `p-${i}`,
          });
          currentParagraph = '';
        }
        elements.push({
          type: 'h3',
          content: line.substring(4),
          key: `h3-${i}`,
        });
      }
      // List items
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (currentParagraph) {
          elements.push({
            type: 'paragraph',
            content: currentParagraph.trim(),
            key: `p-${i}`,
          });
          currentParagraph = '';
        }
        elements.push({
          type: 'listItem',
          content: line.substring(2),
          key: `li-${i}`,
        });
      }
      // Numbered list items
      else if (/^\d+\.\s/.test(line)) {
        if (currentParagraph) {
          elements.push({
            type: 'paragraph',
            content: currentParagraph.trim(),
            key: `p-${i}`,
          });
          currentParagraph = '';
        }
        const match = line.match(/^\d+\.\s(.+)/);
        elements.push({
          type: 'numberedListItem',
          content: match[1],
          key: `nli-${i}`,
        });
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        if (currentParagraph) {
          elements.push({
            type: 'paragraph',
            content: currentParagraph.trim(),
            key: `p-${i}`,
          });
          currentParagraph = '';
        }
        elements.push({
          type: 'blockquote',
          content: line.substring(2),
          key: `bq-${i}`,
        });
      }
      // Regular text
      else {
        currentParagraph += (currentParagraph ? ' ' : '') + line;
      }
    }

    // Add remaining paragraph
    if (currentParagraph) {
      elements.push({
        type: 'paragraph',
        content: currentParagraph.trim(),
        key: `p-final`,
      });
    }

    return elements;
  };

  const renderInlineFormatting = (text) => {
    const parts = [];
    let currentText = text || '';
    let key = 0;

    // Handle bold text **text**
    currentText = currentText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      return `__BOLD_${key++}_${content}__`;
    });

    // Handle italic text *text*
    currentText = currentText.replace(/\*(.*?)\*/g, (match, content) => {
      return `__ITALIC_${key++}_${content}__`;
    });

    // Split by formatting markers and render
    const segments = currentText.split(/(__(?:BOLD|ITALIC)_\d+_.*?__)/);
    
    return segments.map((segment, index) => {
      if (segment.startsWith('__BOLD_')) {
        const content = segment.match(/__BOLD_\d+_(.*?)__/)[1];
        return (
          <Text key={index} style={{ fontWeight: 'bold' }}>
            {content}
          </Text>
        );
      } else if (segment.startsWith('__ITALIC_')) {
        const content = segment.match(/__ITALIC_\d+_(.*?)__/)[1];
        return (
          <Text key={index} style={{ fontStyle: 'italic' }}>
            {content}
          </Text>
        );
      } else {
        return segment;
      }
    });
  };

  const renderElement = (element) => {
    switch (element.type) {
      case 'h1':
        return (
          <Text
            key={element.key}
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.text,
              marginVertical: 16,
              lineHeight: 34,
            }}
          >
            {renderInlineFormatting(element.content)}
          </Text>
        );
      case 'h2':
        return (
          <Text
            key={element.key}
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: colors.text,
              marginVertical: 14,
              lineHeight: 30,
            }}
          >
            {renderInlineFormatting(element.content)}
          </Text>
        );
      case 'h3':
        return (
          <Text
            key={element.key}
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: colors.text,
              marginVertical: 12,
              lineHeight: 26,
            }}
          >
            {renderInlineFormatting(element.content)}
          </Text>
        );
      case 'paragraph':
        return (
          <Text
            key={element.key}
            style={{
              fontSize: 16,
              color: colors.text,
              lineHeight: 24,
              marginVertical: 8,
            }}
          >
            {renderInlineFormatting(element.content)}
          </Text>
        );
      case 'listItem':
        return (
          <View key={element.key} style={{ flexDirection: 'row', marginVertical: 4 }}>
            <Text style={{ color: colors.text, fontSize: 16, marginRight: 8 }}>•</Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.text,
                lineHeight: 24,
                flex: 1,
              }}
            >
              {renderInlineFormatting(element.content)}
            </Text>
          </View>
        );
      case 'numberedListItem':
        return (
          <View key={element.key} style={{ flexDirection: 'row', marginVertical: 4 }}>
            <Text style={{ color: colors.text, fontSize: 16, marginRight: 8 }}>1.</Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.text,
                lineHeight: 24,
                flex: 1,
              }}
            >
              {renderInlineFormatting(element.content)}
            </Text>
          </View>
        );
      case 'blockquote':
        return (
          <View
            key={element.key}
            style={{
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
              paddingLeft: 16,
              marginVertical: 12,
              backgroundColor: colors.surface,
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                lineHeight: 24,
                fontStyle: 'italic',
              }}
            >
              {renderInlineFormatting(element.content)}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const elements = parseMarkdown(content);

  return (
    <View>
      {elements.map(renderElement)}
    </View>
  );
};

export default MarkdownRenderer;