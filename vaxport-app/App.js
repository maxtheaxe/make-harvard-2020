import * as React from 'react';
import { SafeAreaView } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import * as eva from '@eva-design/eva';
import { View, TextInput, StyleSheet } from 'react-native';
import { ApplicationProvider, Layout, IconRegistry, Text, Button, Icon, Input } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as Permissions from 'expo-permissions';
import {
  BarCodeScanner
} from 'expo-barcode-scanner';

const HomeScreen = ({ navigation }) => {
  return (
    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text category = 'h1'>Who are you?</Text>
        <Button size='giant' onPress={() => navigation.navigate('Doctor')}>
          {evaProps => <Text {...evaProps}>Doctor</Text>}
        </Button>
      <Button size='giant' onPress={() => navigation.navigate('Verifier')}>
        {evaProps => <Text {...evaProps}>Verifier</Text>}
      </Button>
    </Layout>
  );
}

class DoctorScreen extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      clinic: ''
    }
  }
  
  render(){
    const PinIcon = (props) => (
      <Icon {...props} name='pin-outline'/>
    );
    return (
      <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text category = 'h1'>Where do you work?</Text>
        
          <Button accessoryLeft = {PinIcon}
          onPress={() => {
            this.setState({
              clinic: 'Massachusetts General Hospital'
            });
            this.props.navigation.navigate('PatientInfo')
            }}>
            {evaProps => <Text {...evaProps}>Massachusetts General Hospital</Text>}
          </Button>
        <Button accessoryLeft = {PinIcon}
        onPress={() => navigation.navigate('PatientInfo')}>
          {evaProps => <Text {...evaProps}>Foxborough: Gillette Stadium</Text>}
        </Button>
        <Button accessoryLeft = {PinIcon}
        onPress={() => navigation.navigate('PatientInfo')}>
          {evaProps => <Text {...evaProps}>Danvers: Doubletree Hotel</Text>}
        </Button>
      </Layout>
    );
  }
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
      <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Input
          placeholder="Enter Vaccine Type"
          value={this.state.vaccine}
          onChangeText={vaccine => this.setState({vaccine})}
          returnKeyType="next"
          numberOfLines={1}
        />
        <Input
          placeholder="Enter Date"
          value={this.state.date}
          onChangeText={date => this.setState({date})}
          returnKeyType="next"
          numberOfLines={1}
        />
        <Input
          placeholder="Enter First Name"
          value={this.state.firstName}
          onChangeText={firstName => this.setState({firstName})}
          returnKeyType="next"
          numberOfLines={1}
        />
        <Input
          placeholder="Enter Last Name"
          value={this.state.lastName}
          onChangeText={lastName => this.setState({lastName})}
          returnKeyType="next"
          numberOfLines={1}
        />
        <Input
          placeholder="Enter Email"
          value={this.state.email}
          onChangeText={email => this.setState({email})}
          returnKeyType="next"
          numberOfLines={1}
        />
        <Button
          onPress={() => {
            console.log('Vaccine type:' + this.state.vaccine +
                        '\nDate:' + this.state.date + 
                        '\nFirst Name:' + this.state.firstName + 
                        '\nLastName' + this.state.lastName + 
                        '\nEmail' + this.state.email)
            // make a post request
            console.log('Json'+ getPatientQRCode(this.state.firstName, this.state.lastName, this.state.email))
            this.props.navigation.navigate('Home')
          }}
        >
          {evaProps => <Text {...evaProps}>Submit</Text>}
        </Button>
      </Layout>
    );
  }
}

 function getPatientQRCode(firstName, lastName, email) {
  try {
    let formdata = new FormData();
    let data = JSON.stringify({
      name: firstName + ' ' + lastName,
      email: email
    });
    formdata.append("patient_data", data);
    let response =  fetch('https://vaxport-mh.herokuapp.com/doctor/vaccinate', {
      method: 'POST',
      mode: 'no-cors',
      body: formdata
    });
    let responseJson =  response.json();
    return responseJson;
  } catch (error) {
    console.error(error);
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

    getVerification(data).then((responseJson)=>{
      this.props.navigation.navigate('ConfirmVerification',{
        patient_name: responseJson.patient_name,
        signatures_ok: responseJson.signatures_ok,
        clinic_compromised: responseJson.clinic_compromised,
        clinic_witness_compromised: responseJson.clinic_witness_compromised,
        clinic_url: responseJson.clinic_url,
        clinic_witness_url: responseJson.clinic_witness_url
      })
    });
    
  };
}

function getVerification(data) {
  try {
    let formdata = new FormData();
    
    formdata.append("patient_data", data);
    let response =  fetch('https://vaxport-mh.herokuapp.com/verifier/verify', {
      method: 'POST',
      mode: 'no-cors',
      body: formdata
    });
    return response.then((response)=>{
      return response.json();
    });
  } catch (error) {
    console.error(error);
  }
}

const ConfirmVerificationScreen = ({ route, navigation }) => {
  const {patient_name, signatures_ok, clinic_compromised, clinic_witness_compromised, clinic_url, clinic_witness_url} = route.params;
  return (
    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text category = 'h1'>{patient_name}</Text>
        <Text category = 'h1'>{signatures_ok}</Text>
        <Text category = 'h1'>{clinic_compromised}</Text>
        <Text category = 'h1'>{clinic_witness_compromised}</Text>
        <Text category = 'h1'>{clinic_url}</Text>
        <Text category = 'h1'>{clinic_witness_url}</Text>
    </Layout>
    // <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //   <Text >Verification</Text>
    //   <Text >{patient_name}</Text>
    //   <Button onPress={() => navigation.navigate('Home')}>
    //     {evaProps => <Text {...evaProps}>Home</Text>}
    //   </Button>
    // </Layout>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <>
    <IconRegistry icons={EvaIconsPack}/>
      <ApplicationProvider {...eva} theme={eva.dark}>
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
            <Stack.Screen name="ConfirmVerification" component={ConfirmVerificationScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
      </>
  );
}

export default App;