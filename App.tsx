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
const myAPIKey = "AIzaSyD8XeoI_NB070SM05Wdi2Rn8xhXmaocic0";
const myWeatherAPIKey = "172d7fd711ea39ffb98f276cc8692a50";

interface ILocation {
  lat: number;
  lng: number;
}

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [city, setCity] = useState<String>('위치 불러오는 중...');
  const [location, setLocation] = useState();
  const [currWeather, setCurrWeather] = useState('Loading...');
  const [currTemp, setCurrTemp] = useState(273);
  const [hourlyWeather, setHourlyWeather] = useState('Loading...');
  const [ok, setOk] = useState(true);

  const getWeather = async () => {
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
      async(loc) => {
        console.log(loc);

        const {latitude, longitude} = loc.coords;
        const location = {
          lat: latitude,
          lng: longitude
        };
        await setLocation(location);

        
        await Geocoder.geocodePosition(location).then(res => {
          // res is an Array of geocoding object (see below)
          console.log(res);
          setCity(res[0].streetName);
        })
        .catch(err => {
          setOk(false);
          console.log(err);
        })
        
        /*
        fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + location.lat + ',' + location.lng + '&key=' + myAPIKey + '&language=ko').then((response) => response.json()) .then((responseJson) => {
          console.log(responseJson.results);
          setCity(responseJson.results[0].formatted_address);
        })
        .catch(err => {
          setOk(false);
          console.log("error : " + err);
        })
        */
        try {
          const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.lng}&exclude=minutely,alerts,daily&appid=${myWeatherAPIKey}`);
          const weatherJson = await weatherRes.json();
          console.log(weatherJson);

          setCurrWeather(weatherJson.current);
          setCurrTemp(weatherJson.current.temp);
          setHourlyWeather(weatherJson.hourly)
        } catch(err) {
          setOk(false);
          console.log("error " + err);
        }
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
      getWeather();
    } else if (Platform.OS === "android") {
      getWeather();
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
          <Text style={styles.instrTitle}>{ok ? (Number(currTemp) - 273).toFixed(1).toString() + "℃" : '-'}</Text>
          <Text style={styles.instrContent}>{ok ? city : '위치 로드 실패'}</Text>
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
