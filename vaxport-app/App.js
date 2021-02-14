import * as React from 'react';
import { Button, View, Text, TextInput, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import {
  BarCodeScanner
} from 'expo-barcode-scanner';

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Doctor"
        onPress={() => navigation.navigate('Doctor')}
      />
      <Button
        title="Verifier"
        onPress={() => navigation.navigate('Verifier')}
      />
    </View>
  );
}

//var clinic;

function DoctorScreen({navigation}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        title="Massachusetts General Hospital"
        onPress={() => navigation.navigate('PatientInfo')}
      />
    </View>
  );
}

class PatientInfoScreen extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      vaccine: '',
      pickedDate: '',
      firstName: '',
      lastName: '',
      email: ''
    }
  }

  render(){
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TextInput 
                placeholder="Enter Vaccine Type"
                value={this.state.vaccine}
                onChangeText={vaccine => this.setState({vaccine})}
                returnKeyType="next"
                underlineColorAndroid='rgba(0,0,0,0)'
                selectionColor={'black'}
                numberOfLines={1}/>
        <TextInput 
                placeholder="Enter Date"
                value={this.state.date}
                onChangeText={date => this.setState({date})}
                returnKeyType="next"
                underlineColorAndroid='rgba(0,0,0,0)'
                selectionColor={'black'}
                numberOfLines={1}/>
        
        <TextInput 
                placeholder="Enter First Name"
                value={this.state.firstName}
                onChangeText={firstName => this.setState({firstName})}
                returnKeyType="next"
                underlineColorAndroid='rgba(0,0,0,0)'
                selectionColor={'black'}
                numberOfLines={1}/>
        <TextInput 
                placeholder="Enter Last Name"
                value={this.state.lastName}
                onChangeText={lastName => this.setState({lastName})}
                returnKeyType="next"
                underlineColorAndroid='rgba(0,0,0,0)'
                selectionColor={'black'}
                numberOfLines={1}/>
        <TextInput 
                placeholder="Enter Email"
                value={this.state.email}
                onChangeText={email => this.setState({email})}
                returnKeyType="next"
                underlineColorAndroid='rgba(0,0,0,0)'
                selectionColor={'black'}
                numberOfLines={1}/>
        <Button
          title="Submit"
          onPress={() => {
            console.log('Vaccine type:' + this.state.vaccine +
                        '\nDate:' + this.state.date + 
                        '\nFirst Name:' + this.state.firstName + 
                        '\nLastName' + this.state.lastName + 
                        '\nEmail' + this.state.email)
            this.props.navigation.navigate('Home')
          }}
        />
      </View>
    );
  }
}


class VerifierScreen extends React.Component  {
  state = {
    hasCameraPermission: null,
    scanned: false,
  };

  async componentDidMount() {
    this.getPermissionsAsync();
  }

  getPermissionsAsync = async() => {
    const {
      status
    } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted'
    });
  };

  render() {
    const {
      hasCameraPermission,
      scanned
    } = this.state;

    if (hasCameraPermission === null) {
      return <Text > Requesting
      for camera permission </Text>;
    }
    if (hasCameraPermission === false) {
      return <Text> No access to camera </Text>;
    }

    return ( <View style = {
        {
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }
      } >
      <BarCodeScanner onBarCodeScanned = {
        scanned ? undefined : this.handleBarCodeScanned
      }
      style = {
        StyleSheet.absoluteFillObject
      }
      />
      {
      scanned && ( <
          Button title = {'Tap to Scan Again'}
          onPress = {() => this.setState({scanned: false})}/>)
        }

      </View>
    );
  }
  handleBarCodeScanned = ({
    type,
    data
  }) => {
    this.setState({
      scanned: true
    });
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    this.props.navigation.navigate('Home');
  };
}


const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Overview' }}
        />
        <Stack.Screen name="Doctor" component={DoctorScreen} />
        <Stack.Screen name="Verifier" component={VerifierScreen} />
        <Stack.Screen name="PatientInfo" component={PatientInfoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;