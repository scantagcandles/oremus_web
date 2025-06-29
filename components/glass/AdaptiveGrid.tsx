import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface AdaptiveGridProps {
  children: React.ReactNode;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
}

export const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  mobileColumns = 2,
  tabletColumns = 3,
  desktopColumns = 4
}) => {
  const { deviceType } = useResponsiveLayout();

  const columns =
    deviceType === 'mobile' ? mobileColumns :
    deviceType === 'tablet' ? tabletColumns : desktopColumns;

  // Rozbij dzieci na wiersze
  const childrenArray = React.Children.toArray(children);
  const rows = [];
  for (let i = 0; i < childrenArray.length; i += columns) {
    rows.push(childrenArray.slice(i, i + columns));
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { justifyContent: 'space-between' }]}> 
          {row.map((child, colIndex) => (
            <View key={colIndex} style={[styles.cell, { flex: 1 / columns }]}> 
              {child}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cell: {
    marginHorizontal: 4,
  },
}); 