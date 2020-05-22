import React from 'react';
import "./index.scss";
import img1 from '../../media/Collection-Slideshow.jpg';
import img2 from '../../media/Collection-Slideshow_1.jpg';
import img3 from '../../media/Collection-Slideshow_2.jpg';
//
import { Link } from "react-router-dom";
import * as ys from "../../youspace.js";
const youspace = new ys.Controller();
const imgArr = [img3, img1, img2];
const linkNameArr = ["fall-winter-19-20", "spring-summer-20-21", "resort-2020"];

const Banner = (props) => {
	return(
		<div className="banner-collections">
			<Link className="banner-link-collections"to="/">Home</Link>
			<Link style={{fontWeight: "bold"}} className="banner-link-collections"to="/collections">Collections</Link>
			<Link className="banner-link-collections"to="/shop">Shop</Link>
		</div>
	);
}

const TopBar = (props) => {
	return(
		<div className="top-bar">
		</div>
	);
}

const RightSlide = (props) => {
	const myArr = [...imgArr];
	const myLinkArr = [...linkNameArr];
	const propArr = myArr.map((img, index) => {
		return <Link to={`/collections/${myLinkArr[index]}`} className="right-slide-img" style={props.slideData[index].style} key={img}><img src={`${img}`}></img></Link>;
	});

	return(
		<div className="right-slide" >{propArr}</div>
	);
}

const InfoContainer = (props) => {
	return(
		<div className="info-container">
			<div className="info-one" style={props.slideData[0].style}>
				<h1 className="spring">Fall</h1>
				<h1 className="summer">Winter</h1>
				<sup className="year">19-20</sup>
				<p className="info-two-content">This season, FW19/20 collection steps out of the signature black and white tones to move towards a more colorful palette.</p>
			</div>
			<div className="info-two" style={props.slideData[1].style}>
				<h1 className="spring">Spring</h1>
				<h1 className="summer">Summer</h1>
				<sup className="year">20-21</sup>
				<p className="info-two-content">This season, the spring summer 20 collection explores the idea of being oneself, far from the rules imposed to us and evolves around two major axes: a desire for calmness but also a desire to celebrate life.</p>
			</div>
			<div className="info-three" style={props.slideData[2].style}>
				<h1 className="spring" style={{top: "12%"}} >Resort</h1>
				<sup className="year" style={{top: "20%", left: "48%"}} >20-21</sup>
				<p className="info-two-content" style={{top: "37%"}}>The Resort 20 is a retrospective of the iconic hollywood nights.</p>
			</div>
		</div>
	);
}

const ButtonContainer = (props) => {
	return(
		<div className="button-container">
			<div className="right-button" onClick={props.handleRight} >
				<div className="right-tri-line" ></div>
				<div className="right-tri-head" ></div>
			</div>
			<div className="left-button" onClick={props.handleLeft} >
				<div className="left-tri-line" ></div>
				<div className="left-tri-head" ></div>
			</div>
		</div>
	);
}

const CenterSlide = (props) => {

	return(
		<div className="center-slide" >
			<InfoContainer slideData={props.slideData} />
			<ButtonContainer handleRight={props.handleRight} handleLeft={props.handleLeft} />
		</div>
	);
}

const LeftSlide = (props) => {
	const myArr = [...imgArr];
	myArr.unshift(myArr.pop());
	const propArr = myArr.map((img, index) => {
		return <div className="right-slide-img" style={props.slideData[index].style} key={img}><img src={`${img}`}></img></div>;
	});

	return(
		<div className="left-slide">{propArr}</div>
	);
}

class Collections extends React.Component{
	constructor(props) {
		super(props);
		// Ref
		this.collectionsRef = null;
		this.rightSlideEle = null;
		this.leftSlideEle = null;
		this.centerSlideEle = null;
		// Ref Callback
		this.setCollectionsRef = (element) => {
			this.collectionsRef = element;
		}
		// State
		this.state = {
						slideData: {
									0: { 
											style: { 
														left:"-100%",
														opacity: 0
													} 
										},
									1: { 
											style: { 
														left: "0%",
														opacity: 100
													} 
										},
									2: { 
											style: { 
														left: "100%",
														opacity: 0
													} 
										}
								},
						curInd: 1
					}

	}

	componentDidMount = ()=>{
		this.rightSlideEle = this.collectionsRef.querySelector(".right-slide");
		this.leftSlideEle = this.collectionsRef.querySelector(".left-slide");
		this.centerSlideEle = this.collectionsRef.querySelector(".info-container");
	}

	handleRight = (event) => {
		let tmpInd = ((( this.state.curInd + 1 )% 3) + 3) % 3;
		const newState = {
			slideData: {},
			curInd: tmpInd
		};
		Object.keys(this.state.slideData).forEach( key => {
			let parseKey = parseInt(key);
			newState.slideData[key] = {};
			newState.slideData[key].style = {};
			newState.slideData[key].style.left = this.calculateRightPos(this.state.slideData[key].style.left);
			newState.slideData[key].style.opacity = parseKey == tmpInd ? 100 : 0;
		});
		this.setState(newState);
	}

	handleLeft = (event) => {
		let tmpInd = ((( this.state.curInd - 1 )% 3) + 3) % 3;
		const newState = {
			slideData: {},
			curInd: tmpInd
		};
		Object.keys(this.state.slideData).forEach( key => {
			let parseKey = parseInt(key);
			newState.slideData[key] = {};
			newState.slideData[key].style = {};
			newState.slideData[key].style.left = this.calculateLeftPos(this.state.slideData[key].style.left);
			newState.slideData[key].style.opacity = parseKey == tmpInd ? 100 : 0;
		});

		this.setState(newState);
	}

	calculateLeftPos = (str) => {
		return (((((parseInt(str.replace('%','')) + 200) % 300) + 300) % 300) - 100) + "%";
	}

	calculateRightPos = (str) => {
		return ((((parseInt(str.replace('%','')) % 300) + 300) % 300) - 100) + "%";
	}

	render() {
		return(
			<div ref={this.setCollectionsRef}>
				<RightSlide slideData={this.state.slideData} />
				<TopBar />
				<LeftSlide slideData={this.state.slideData} />
				<Banner />
				<CenterSlide slideData={this.state.slideData} handleRight={this.handleRight} handleLeft={this.handleLeft}/>
			</div>
		);
	}
}

export default Collections;





















