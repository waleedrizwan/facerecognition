import React, {Component} from 'react';
import './App.css';
import Navigation from './Components/Navigation/navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register'



const particlesOptions = {
                      particles: {
                        number: {
                          value: 100,
                          density: {
                            enable:true,
                            value_area: 800
                          }
                        },

                        line_linked: {
                          shadow: {
                            enable: false,
                            color: "#d13059",
                            blur: 1000
                          }
                        }
                      }
                    }


const initialState = { //sets initial state of web page, no image URL 0 entries
      input: '',
      imageURL: '',
      box: {},
      route: 'SignIn',
      isSignedIn:false,
      user: {
        id: '',
        name: '',
        email: '',       
        entries: 0,
        joined: ''
      }
    }


class App extends Component {

  constructor () {
    super ();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {       
        id: data.id,
        name: data.name,
        email: data.email,       
        entries: data.entries,
        joined: data.joined
    }})
  }


  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("InputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height); // dimensions of box around faces in uploaded image 
    console.log(clarifaiFace);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height, 
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)

    }
  }

  
  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});


  }



  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }


  onSubmit = () => {
    
    this.setState({imageURL: this.state.input});
      fetch("http://localhost:3001/imageurl", {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify ({
              input: this.state.input
        })
      })
    .then(response => response.json())
    .then(response => {
      if (response){
        fetch("http://localhost:3001/image", {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify ({
              id: this.state.user.id
        })
      })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries:count}))
      })
      .catch(console.log) // unexpected errors 
    }
      this.displayFaceBox(this.calculateFaceLocation(response))
     }) 
     .catch(err => console.log(err)); //if API fails
}

  onRouteChange = (route) => {

    if (route === 'signout') {
      this.setState(initialState)
    
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  onSignOut = () => {
    this.setState({route: 'SignIn'});
  }

  render () {
    const {isSignedIn, imageURL, route, box} = this.state;
    return (
      <div className="App">
        <Particles className = 'particles'
                    params={particlesOptions}      
                  />
        <Navigation isSignedIn ={isSignedIn} onRouteChange = {this.onRouteChange}/>
        { route === "home" 
          ? <div>
            
              <Rank
               name = {this.state.user.name}
               entries = {this.state.user.entries}
             /> 
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onSubmit={this.onSubmit}
                />  
            <FaceRecognition box = {box} imageURL= {imageURL} />
          </div> 
          : (
             route ==='SignIn'
             ? <SignIn loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
             : <Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
        )
      }
      </div>
    );
  }
}

export default App;
      