import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf, Image } from '@react-pdf/renderer';
import { LogEntry } from './CPRLog';

// Register Hebrew font
Font.register({
  family: 'Noto',
  fonts: [
    {
      src: '/fonts/noto/static/NotoSansHebrew-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: '/fonts/noto/static/NotoSansHebrew-Bold.ttf',
      fontWeight: 700,
    },
  ]
});

interface CPRLogPDFProps {
  entries: LogEntry[];
  hospital: string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Noto',
    backgroundColor: 'white',
    color: '#1D426E',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    height: 30,
  },  
  headerText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#1D426E',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D426E',
  },
  headerLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  logo: {
    maxHeight: 30,
    marginLeft: 10,
    objectFit: 'contain',
  },
  appLogo: {
    maxHeight: 30,
    objectFit: 'contain'
  },
  container: {
    flex: 1,
    direction: 'rtl',
  },
  patientSticker: {
    width: '226.77',
    height: '113.38',
    border: 1,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  section: {
    marginBottom: 20,
    direction: 'rtl',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 10,
    textAlign: 'right',
    color: '#1D426E',
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#1D426E',
    borderBottomStyle: 'solid',
    minHeight: 25,
    alignItems: 'center',
  },
  timeCell: {
    width: '20%',
    padding: 5,
    textAlign: 'right',
    fontSize: 12,
    color: '#1D426E',
  },
  textCell: {
    width: '80%',
    padding: 5,
    textAlign: 'right',
    fontSize: 12,
    color: '#1D426E',
    direction: 'rtl',
  },
  medicationTextCell: {
    width: '80%',
    padding: 5,
    textAlign: 'right',
    fontSize: 12,
    color: '#1D426E',
    direction: 'ltr',
  },
  signatureLine: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: '#1D426E',
    borderTopStyle: 'solid',
    paddingTop: 10,
    textAlign: 'right',
    alignSelf: 'flex-end',
    width: '25%',
  },
  date: {
    marginBottom: 20,
    textAlign: 'right',
    color: '#1D426E',
  },
  text: {
    fontFamily: 'Noto',
    textAlign: 'right',
    color: '#1D426E',
  },
  stickerText: {
    fontFamily: 'Noto',
    textAlign: 'center',
    fontSize: 14,
    color: '#1D426E',
  },
  textSegment: {
    fontFamily: 'Noto',
    color: '#1D426E',
  },
  medicationTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  }
});

// Separate PDF Document Component
const CPRLogPDFDocument: React.FC<CPRLogPDFProps> = ({ entries, hospital }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatCreationDate = (date: Date) => {
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
  };

/**
   * Renders text with proper directional handling for mixed Hebrew and English content.
   * 
   * The function handles several complex cases:
   * 1. Pure Hebrew text (RTL)
   * 2. Pure English/numbers text (LTR)
   * 3. Mixed content with both Hebrew and English
   * 4. Punctuation marks:
   *    - Within same script: kept with the text
   *    - Between scripts: treated as separate tokens
   * 5. Proper whitespace preservation between different scripts
   * 
   * @param text - The input text to be rendered
   * @param type - The type of entry ('medication' | 'action' | 'patientDetails')
   * @returns A View component with properly directed text segments
   */
const renderTextWithDirections = (text: string, type: LogEntry['type']) => {
  // Special case: medications are always LTR
  if (type === 'medication') {
    return (
      <View style={styles.medicationTextContainer}>
        <Text style={styles.textSegment}>
          {text}
        </Text>
      </View>
    );
  }

  /**
   * Regular expression breakdown:
   * (\s+) - Captures whitespace sequences
   * | - OR
   * ([,.\-_:;()'"]+) - Captures punctuation marks as separate tokens
   * | - OR
   * ([a-zA-Z0-9][a-zA-Z0-9\s]*) - Captures English sequences
   * | - OR
   * ([־\u0590-\u05FF]+) - Captures Hebrew sequences
   */
  const segments = text.split(/(\s+)|([,.\-_:;()'"]+)|([a-zA-Z0-9][a-zA-Z0-9\s]*)|([־\u0590-\u05FF]+)/g)
    .filter(segment => segment !== '' && segment !== undefined);
  
  // Array to hold processed segments with their directional properties
  const combinedSegments: {
    text: string;           // The actual text content
    isEnglish: boolean;     // Whether this segment should be LTR
    isSpace: boolean;       // Whether this is a whitespace segment
    isPunctuation: boolean; // Whether this is a punctuation mark
  }[] = [];
  
  let currentEnglishSegment = '';
  
  segments.forEach((segment) => {
    // Handle whitespace segments
    if (/^\s+$/.test(segment)) {
      // If we have a pending English segment, push it first
      if (currentEnglishSegment) {
        combinedSegments.push({
          text: currentEnglishSegment.trim(),
          isEnglish: true,
          isSpace: false,
          isPunctuation: false
        });
        currentEnglishSegment = '';
      }
      
      // Push the whitespace segment
      combinedSegments.push({
        text: ' ',
        isEnglish: false,
        isSpace: true,
        isPunctuation: false
      });
      return;
    }

    // Handle punctuation marks
    if (/^[,.\-_:;()'"]+$/.test(segment)) {
      // If we have a pending English segment, push it first
      if (currentEnglishSegment) {
        combinedSegments.push({
          text: currentEnglishSegment.trim(),
          isEnglish: true,
          isSpace: false,
          isPunctuation: false
        });
        currentEnglishSegment = '';

        // Add space before punctuation
        combinedSegments.push({
          text: ' ',
          isEnglish: false,
          isSpace: true,
          isPunctuation: false
        });
      }

      // Push the punctuation mark
      combinedSegments.push({
        text: segment,
        isEnglish: false,
        isSpace: false,
        isPunctuation: true
      });

      // Add space after punctuation
      combinedSegments.push({
        text: ' ',
        isEnglish: false,
        isSpace: true,
        isPunctuation: false
      });
      return;
    }

    // Test if the segment is English
    const isEnglish = /^[a-zA-Z0-9][a-zA-Z0-9\s]*$/.test(segment);
    
    if (isEnglish) {
      // Collect English segments to combine them
      currentEnglishSegment = currentEnglishSegment 
        ? `${currentEnglishSegment}${segment}`
        : segment;
    } else {
      // If we have a pending English segment, push it first
      if (currentEnglishSegment) {
        combinedSegments.push({
          text: currentEnglishSegment.trim(),
          isEnglish: true,
          isSpace: false,
          isPunctuation: false
        });
        currentEnglishSegment = '';
        
        // Add a space between English and Hebrew if not already present
        if (!combinedSegments[combinedSegments.length - 1]?.isSpace) {
          combinedSegments.push({
            text: ' ',
            isEnglish: false,
            isSpace: true,
            isPunctuation: false
          });
        }
      }
      
      // Push the Hebrew segment
      combinedSegments.push({
        text: segment,
        isEnglish: false,
        isSpace: false,
        isPunctuation: false
      });
    }
  });
  
  // Handle any remaining English segment at the end
  if (currentEnglishSegment) {
    // Add a space before if the last segment was Hebrew and no space exists
    if (combinedSegments.length > 0 && 
        !combinedSegments[combinedSegments.length - 1].isEnglish &&
        !combinedSegments[combinedSegments.length - 1].isSpace) {
      combinedSegments.push({
        text: ' ',
        isEnglish: false,
        isSpace: true,
        isPunctuation: false
      });
    }
    
    combinedSegments.push({
      text: currentEnglishSegment.trim(),
      isEnglish: true,
      isSpace: false,
      isPunctuation: false
    });
  }

  // Remove duplicate spaces and unnecessary spaces around punctuation
  const cleanedSegments = combinedSegments.reduce((acc, curr, idx, arr) => {
    // Skip if this is a space and the next item is also a space
    if (curr.isSpace && arr[idx + 1]?.isSpace) {
      return acc;
    }
    acc.push(curr);
    return acc;
  }, [] as typeof combinedSegments);

  // Render the segments in a right-to-left container
  return (
    <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
      {cleanedSegments.map((segment, index) => (
        <Text
          key={index}
          style={[
            styles.textSegment,
            {
              // @ts-ignore
              direction: segment.isEnglish ? 'ltr' : 'rtl',
            }
          ]}
        >
          {segment.text}
        </Text>
      ))}
    </View>
  );
};

  const hospitalLogoPath = `../../assets/${hospital}/logo.png`;
  const appLogoPath = '/apps/assets/logo/IconOnly_Transparent_NoBuffer.png';

  const renderTable = (type: LogEntry['type']) => {
    const typeEntries = entries.filter(entry => entry.type === type);
    
    return (
      <View style={styles.table}>
        {typeEntries.map((entry) => (
          <View key={entry.id} style={styles.tableRow}>
            <View style={styles.timeCell}>
              <Text style={styles.text}>{formatTime(entry.timestamp)}</Text>
            </View>
            <View style={type === 'medication' ? styles.medicationTextCell : styles.textCell}>
              {renderTextWithDirections(entry.text, type)}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {formatCreationDate(new Date())}
          </Text>
          <Text style={styles.headerTitle}>החייאה</Text>
          <View style={styles.headerLogos}>
            {hospital !== 'apps' && <Image src={hospitalLogoPath} style={styles.logo} />}
            <Image 
              src={appLogoPath} 
              style={hospital === 'apps' ? styles.appLogo : styles.logo} 
            />
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.patientSticker}>
            <Text style={styles.stickerText}>מדבקת מטופל</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>נתוני מטופל</Text>
            {renderTable('patientDetails')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>תרופות שניתנו</Text>
            {renderTable('medication')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>פעולות שנעשו</Text>
            {renderTable('action')}
          </View>

          <View style={styles.signatureLine}>
            <Text style={styles.text}>חתימת הרופא</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Export Button Component
const ExportButton: React.FC<CPRLogPDFProps> = ({ entries, hospital }) => {
  const handleExport = async () => {
    const blob = await pdf(<CPRLogPDFDocument entries={entries} hospital={hospital} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cpr-log-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button 
      onClick={handleExport}
      style={{
        display: 'block',
        margin: '20px auto',
        padding: '10px 20px',
        backgroundColor: '#1FB5A3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      ייצא לקובץ
    </button>
  );
};

export default ExportButton;