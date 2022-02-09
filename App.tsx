/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import Geolocation, { getCurrentPosition } from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoder';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ILocation {
  lat: number;
  lng: number;
}

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [city, setCity] = useState<String>('위치 불러오는 중...');
  const [ok, setOk] = useState(true);

  const requestPermission = async () => {
    if (Platform.OS === "android") {
      const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      
      if (result['android.permission.ACCESS_COARSE_LOCATION']
        && result['android.permission.ACCESS_FINE_LOCATION']
      === 'granted') {
        console.log("모든 권한 획득");
      } else {
        setOk(false);
        console.log("권한거절");
      }
    }
 
    await Geolocation.getCurrentPosition(
      loc => {
        console.log(loc);

        const {latitude, longitude} = loc.coords;
        const location = {
          lat: latitude,
          lng: longitude
        };

        Geocoder.geocodePosition(location).then(res => {
          // res is an Array of geocoding object (see below)
          console.log(res);
          setCity(res[0].formattedAddress);
        })
        .catch(err => {
          setOk(false);
          console.log(err)
        })
      },
      error => {
        // See error code charts below.
        setOk(false);
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  useEffect(() => {
    if (Platform.os === 'ios') {
      Geolocation.requestAuthorization('always');
    } else if (Platform.OS === "android") {
      requestPermission();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={'transparent'}
        translucent={true}
        barStyle={'light-content'} />
      
      <View style={styles.mainPage}>
        <Text style={styles.mainText}>이 앱은 날씨 앱이 될 것입니다.</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.instruction}
      >
        <View style={styles.instrPage}>
          <Text style={styles.instrTitle}>앱 안내 부분</Text>
          <Text style={styles.instrContent}>{ok ? city : '위치 로드 실패'}</Text>
        </View>
        <View style={styles.instrPage}>
          <Text style={styles.instrTitle}>앱 안내 부분</Text>
          <Text style={styles.instrContent}>앱 안내 부분</Text>
        </View>
        <View style={styles.instrPage}>
          <Text style={styles.instrTitle}>앱 안내 부분</Text>
          <Text style={styles.instrContent}>앱 안내 부분</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightcoral'
  },
  mainPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  instruction: {
    
  },
  instrPage: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignItems: 'center'
  },
  instrTitle: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 30
  },
  instrContent: {
    marginTop: 20,
    fontSize: 18,
    color: 'black',
  }
});

export default App;
