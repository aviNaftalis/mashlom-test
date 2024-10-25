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

  const renderTextWithDirections = (text: string) => {
    // Split text into segments that might contain English letters, numbers, or other characters
    const segments = text.split(/([a-zA-Z]+[/a-zA-Z0-9]*|[0-9/]+)/g);
    
    return (
      <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        {segments.map((segment, index) => {
          // Check if the segment contains any English letters
          const isEnglish = /[a-zA-Z]/.test(segment);
          console.log(segment, isEnglish);
          return (
            <Text
              key={index}
              style={[
                styles.textSegment,
                {
                  // @ts-ignore
                  direction: isEnglish ? 'ltr' : 'rtl',
                }
              ]}
            >
              {segment}
            </Text>
          );
        })}
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
            <View style={styles.textCell}>
              {renderTextWithDirections(entry.text)}
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