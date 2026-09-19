import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { fontSize: 18, color: '#0ea5e9', marginBottom: 20, fontFamily: 'Helvetica-Bold' },
  section: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingVertical: 4 },
  label: { color: '#555' },
  total: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginTop: 10, textAlign: 'right' },
});

export default function FacturePDF({ record }: { record: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>FACTURE</Text>

        <View style={styles.section}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{record.company_name}</Text>
          <Text>{record.address} — {record.city}, {record.country}</Text>
          <Text>RC: {record.company_registration_no} · NIF: {record.tax_id_no}</Text>
          <Text>{record.email} · {record.phone}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}><Text style={styles.label}>Type de stand</Text><Text>{record.stand_type} DA</Text></View>
          <View style={styles.row}><Text style={styles.label}>Surface</Text><Text>{record.surface} m²</Text></View>
          {record.facade && <View style={styles.row}><Text style={styles.label}>Façade</Text><Text>{record.facade} DA</Text></View>}
          {record.catalogue && <View style={styles.row}><Text style={styles.label}>Catalogue</Text><Text>{record.catalogue} DA</Text></View>}
          {record.exhibitor_badges > 0 && <View style={styles.row}><Text style={styles.label}>Badges exposant</Text><Text>{record.exhibitor_badges}</Text></View>}
          {record.access_passes > 0 && <View style={styles.row}><Text style={styles.label}>Pass d'accès</Text><Text>{record.access_passes}</Text></View>}
          {record.hostess_selected && <View style={styles.row}><Text style={styles.label}>Hôtesse</Text><Text>Oui</Text></View>}
        </View>

        <Text style={styles.total}>TOTAL HT: {record.total_ht} DA</Text>
        <Text style={{ marginTop: 20, fontSize: 9, color: '#888' }}>Statut de la demande: {record.STATUS}</Text>
      </Page>
    </Document>
  );
}