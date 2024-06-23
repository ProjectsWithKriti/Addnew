import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  PermissionsAndroid,
  Alert,
  DeviceEventEmitter,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import uuid from 'react-native-uuid';
import axios from 'axios';

const Home = () => {
  const [receiveSmsPermission, setReceiveSmsPermission] = useState('');
  const [msgList, setMsgList] = useState([]);

  useEffect(() => {
    getData().then(data => {
      if (data) {
        setMsgList(data);
        filterAndSendMessagesToServer(data);
      } else {
        setMsgList([
          {
            id: uuid.v4(),
            msgbody: 'demo msg',
            senderPhoneNumber: '1234567890',
            isUseFull: false,
          },
        ]);
      }
    });
  }, []);

  const storeData = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('all-msgs', jsonValue);
    } catch (e) {
      console.log('Error saving data', e);
    }
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('all-msgs');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log('Error reading data', e);
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

  const sendSmsToServer = async (messageBody, senderPhoneNumber, sentTime, receiveTime) => {
    try {
      const response = await axios.post('http://172.20.10.3:3000/sms', {
        messageBody,
        senderPhoneNumber,
        sentTime,
        receiveTime,
      });
      console.log('Response from backend:', response.data);
    } catch (error) {
      console.error('Error sending SMS to backend:', error);
    }
  };

  const filterAndSendMessagesToServer = async (messages) => {
    const sentTime = new Date('2024-06-10T12:34:56'); // Replace with actual sent time
    const receiveTime = new Date(); // Current time

    const filteredMessages = messages.filter(
      message =>
        message.senderPhoneNumber === 'AD-ICICI' || message.msgbody.includes('ICICI Bank')
    );

    filteredMessages.forEach(message => {
      sendSmsToServer(message.msgbody, message.senderPhoneNumber, sentTime, receiveTime);
    });
  };

  const addNewMsg = (messageBody, senderPhoneNumber) => {
    const newMsg = {
      id: uuid.v4(),
      senderPhoneNumber,
      msgbody: messageBody,
      isUseFull: false,
    };

    const sentTime = new Date('2024-06-10T12:34:56'); // Replace with actual sent time
    const receiveTime = new Date(); // Current time

    if (senderPhoneNumber === 'AD-ICICI' || messageBody.includes('ICICI Bank')) {
      sendSmsToServer(messageBody, senderPhoneNumber, sentTime, receiveTime);
    }

    setMsgList(prevMsgList => {
      const updatedMsgList = [...prevMsgList, newMsg];
      storeData(updatedMsgList);
      return updatedMsgList;
    });
  };

  useEffect(() => {
    requestSmsPermission();
  }, []);

  useEffect(() => {
    if (receiveSmsPermission === PermissionsAndroid.RESULTS.GRANTED) {
      const subscriber = DeviceEventEmitter.addListener(
        'onSMSReceived',
        message => {
          const { messageBody, senderPhoneNumber } = JSON.parse(message);
          const sentTime = new Date('2024-06-10T12:34:56');
          const receiveTime = new Date();
          const formattedSentTime = sentTime.toLocaleString();
          const formattedReceiveTime = receiveTime.toLocaleString();

          Alert.alert(
            'SMS received',
            `Message Body: ${messageBody} \nSender Number: ${senderPhoneNumber} \nSent Time: ${formattedSentTime} \nReceive Time: ${formattedReceiveTime}`
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
  };

  const clearAllMessages = async () => {
    try {
      await AsyncStorage.removeItem('all-msgs');
      setMsgList([]);
      console.log('All messages cleared');
    } catch (e) {
      console.log('Error clearing messages', e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#242526' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Latest Messages</Text>
        </View>
        <Text style={styles.subHeader}>All</Text>

        <View style={styles.clearButtonContainer}>
          <Button title="Clear All Messages" onPress={clearAllMessages} color="#ff0000" />
        </View>

        <FlatList
          data={msgList}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <View style={[styles.messageContainer, { backgroundColor: item.isUseFull ? '#17B169' : '#3a3b3c' }]}>
              <View style={styles.messageTextContainer}>
                <Text style={styles.senderText}>From {item.senderPhoneNumber}</Text>
                <Text style={styles.messageText}>Message: {item.msgbody}</Text>
              </View>
              <TouchableOpacity style={styles.checkButton} onPress={() => toggleMessageUsefulness(index)}>
                {item.isUseFull ? (
                  <Text style={styles.accessText}>Access</Text>
                ) : (
                  <Icon name="check" size={20} color="#e4e6eb" />
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    paddingLeft: 20,
    backgroundColor: '#18191a',
    height: 66,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    color: '#e4e6eb',
    fontWeight: '500',
  },
  subHeader: {
    color: '#e4e6eb',
    padding: 5,
    marginLeft: 8,
  },
  clearButtonContainer: {
    padding: 10,
    alignItems: 'center',
  },
  messageContainer: {
    padding: 10,
    margin: 8,
    marginTop: 4,
    marginBottom: 4,
    elevation: 2,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageTextContainer: {
    flexDirection: 'column',
  },
  senderText: {
    fontSize: 16,
    color: '#e4e6eb',
  },
  messageText: {
    fontSize: 14,
    marginTop: 1,
    color: '#e4e6eb',
  },
  checkButton: {
    justifyContent: 'center',
    marginRight: 10,
  },
  accessText: {
    color: '#e4e6eb',
    fontSize: 16,
  },
});
