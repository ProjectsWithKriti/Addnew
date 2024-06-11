import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  NativeModules,
  PermissionsAndroid,
  Alert,
  DeviceEventEmitter,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Home = () => {
  const [receiveSmsPermission, setReceiveSmsPermission] = useState('');
  const [msgList, setMsgList] = useState([]);

  useEffect(() => {
    getData().then(data => {
      if (data) {
        setMsgList(data);
        console.log('data after getting from async storage: ', data);
      } else {
        setMsgList({
          id: 1,
          msg: 'demo msg',
          senderPhoneNumber: '1234567890',
          isUseFull: false,
        });
      }
    });
  }, []);

  //api to sent data to server

  const storeData = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('all-msgs', jsonValue);
    } catch (e) {
      // saving error
    }
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('all-msgs');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  };

  const requestSmsPermission = async () => {
    try {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      );
      setReceiveSmsPermission(permission);
    } catch (err) {
      console.log(err);
    }
  };
  const addNewMsg = (message, senderPhoneNumber, length) => {
    const msgId = msgList.length + 1;

    console.log('length of msgList: ', msgList.length);
    const newMsg = {
      id: msgId,
      senderPhoneNumber: senderPhoneNumber,
      msgbody: message,
      isUseFull: false,
    };
    setMsgList(prevMsgList => [...prevMsgList, newMsg]);
    storeData([...msgList, newMsg]);
  };

  useEffect(() => {
    requestSmsPermission();
  }, []);

  useEffect(() => {
    if (receiveSmsPermission === PermissionsAndroid.RESULTS.GRANTED) {
      let subscriber = DeviceEventEmitter.addListener(
        'onSMSReceived',
        message => {
          count += 1;
          const {messageBody, senderPhoneNumber} = JSON.parse(message);
          Alert.alert(
            'SMS received',
            `Message Body: ${messageBody} & sender number: ${senderPhoneNumber}`,
          );
          addNewMsg(messageBody, senderPhoneNumber);
        },
      );

      return () => {
        subscriber.remove();
      };
    }
  }, [receiveSmsPermission]);

  const toggleMessageUsefulness = index => {
    setMsgList(prevMsgList => {
      const updatedMsgList = [...prevMsgList];
      updatedMsgList[index] = {
        ...updatedMsgList[index],
        isUseFull: !updatedMsgList[index].isUseFull,
      };
      storeData(updatedMsgList);
      return updatedMsgList;
    });

    console.log('msgList: -------------', msgList);
  };

  useEffect(() => {
    console.log('msgList: ', msgList);
    /////
    ////call method for api
  }, [msgList]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#242526'}}>
      <View style={styles.container}>
        <View
          style={{
            padding: 10,
            paddingLeft: 20, //Left: 10,
            backgroundColor: '#18191a',
            height: 66,
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 18, color: '#e4e6eb', fontWeight: '500'}}>
            Latest Messages
          </Text>
        </View>
        <Text style={{color: '#e4e6eb', padding: 5, marginLeft: 8}}>All</Text>
        <FlatList
          data={msgList}
          renderItem={({item, index}) => {
            return (
              <View
                style={{
                  padding: 10,
                  backgroundColor: item.isUseFull ? '#17B169' : '#3a3b3c',
                  margin: 8,
                  marginTop: 4,
                  marginBottom: 4,
                  elevation: 2,
                  borderRadius: 10,
                  flexDirection: 'row',
                  flex: 1,
                  justifyContent: 'space-between',
                }}>
                <View style={{flexDirection: 'column'}}>
                  <Text style={[styles.titleText, {color: '#e4e6eb'}]}>
                    From {item.senderPhoneNumber}
                  </Text>
                  <Text
                    style={[styles.titleText, {fontSize: 14, marginTop: 1}]}>
                    Message: {item.msgbody}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{justifyContent: 'center', marginRight: 10}}
                  onPress={
                    () => toggleMessageUsefulness(index)
                    // msgList[index].isUseFull = !item.isUseFull)}
                  }>
                  {item.isUseFull ? (
                    <Text style={styles.titleText}>Added</Text>
                  ) : (
                    <Icon name="check" size={20} color="#e4e6eb" />
                  )}
                </TouchableOpacity>
              </View>
            );
          }}></FlatList>
      </View>
    </SafeAreaView>
  );
};
export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    color: '#e4e6eb',
  },
});
// #3a3b3c
