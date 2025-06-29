import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { mediaService } from '../../../services/mediaService';

export const ODBPlayerScreen: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const cats = await mediaService.getAudioCategories();
        setCategories(cats);
      } catch (e) {
        // obsługa błędu
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchTracks = async () => {
        setLoading(true);
        try {
          const tr = await mediaService.getAudioTracks(selectedCategory);
          setTracks(tr || []);
        } catch (e) {
          // obsługa błędu
        }
        setLoading(false);
      };
      fetchTracks();
    }
  }, [selectedCategory]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>ODB Player</Text>
      {loading && <ActivityIndicator size="large" color="#888" />}
      <Text style={{ marginBottom: 8 }}>Kategorie:</Text>
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: selectedCategory === item ? '#e0e0e0' : '#fff',
              borderRadius: 8,
              marginRight: 8,
              borderWidth: 1,
              borderColor: '#ccc',
            }}
            onPress={() => setSelectedCategory(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 16 }}
      />
      <Text style={{ marginBottom: 8 }}>Playlist:</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: currentTrack && currentTrack.id === item.id ? '#d0e0ff' : '#fff',
              borderRadius: 8,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: '#ccc',
            }}
            onPress={() => setCurrentTrack(item)}
          >
            <Text>{item.title}</Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 16 }}
      />
      {currentTrack && (
        <View style={{ padding: 16, borderWidth: 1, borderColor: '#aaa', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>{currentTrack.title}</Text>
          {/* Tu można dodać odtwarzacz audio */}
          <Button title="Odtwórz" onPress={() => {/* obsługa odtwarzania */}} />
        </View>
      )}
    </View>
  );
};

export default ODBPlayerScreen; 