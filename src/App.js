import React from 'react';
import ReactDom from 'react-dom';
import { Home, Collections, Shop, NotFound, CollectionDetail, ProductDetail } from "./containers";
import * as ys from "./youspace.js";
// 
//
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from "react-router-dom";

class App extends React.Component{
	render(){
		let youspace = new ys.Controller();
		// youspace.connect();
		return(
			<Router>
				<Switch>
					<Route exact path="/" component={Home} />
					<Route exact path="/collections" component={Collections} />
					<Route exact path="/collections/:collectionName" component={CollectionDetail} />
					<Route exact path="/shop" component={Shop} />
					<Route exact path="/shop/:productName" component={ProductDetail} />
					<Route exact path="/404" component={NotFound} />
					<Redirect to="/404" />
				</Switch>
			</Router>
		);
	}
}

export default App; 









