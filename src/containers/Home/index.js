import React from 'react';
import "./index.scss";
//
import { Link } from "react-router-dom";

const Banner = (props) => {
	return(
		<div className="banner-home">
			<Link className="banner-link-home" to="/">Home</Link>
			<Link className="banner-link-home" to="/collections">Collections</Link>
			<Link className="banner-link-home" to="/shop">Shop</Link>
		</div>
	);
}

const TopImage = (props) => {
	return(
		<div className="top-image-home">
		</div>
	);
}

const TopText = (props) => {
	return(
		<div className="top-text-home">
			<div className="spring-home">Spring</div>
			<div className="summer-home">Summer</div>
			<sup className="year-home">2020</sup>
			<div className="collection-home"><div style={{top: "10px", left: "50px", position: "absolute"}}>collection</div></div>
			<div className="discover-home"><div style={{top: "-35px", left: "38px", position: "absolute"}}>Discover</div></div>
		</div>
	);
}

const Top = (props) => {
	return(
		<div className="top-home">
			<TopImage />
			<TopText />
		</div>
	);
}

const PictureContainer = React.forwardRef((props, ref) => {
	return(
		<div ref={ref} className="picture-container-home">
			<div className="pic1-home"></div>
			<div className="pic2-home"></div>
		</div>
	);
});

const AboutContainer = (props) => {
	return(
		<div className="about-container-home">
			<img src={require('../../media/cxc.jpg')}></img>
		</div>
	);
}

const VideoText = (props) => {
	return(
		<div style={{left: "20%", top: "10%"}} className="top-text-home">
			<div className="video-behind-home">Behind</div>
			<div className="video-brand-home">the brand</div>
			<sup className="video-content-home">Drawing inspiration from art, architecture, and global culture, BRAND combines straight-lined designs with elegant sophistication; a refined statement that beautifies women and glorifies their personality.</sup>
			<div className="video-identity-home"><div style={{top: "10px", left: "50px", position: "absolute"}}>our identity</div></div>
			<div className="video-about-text-home"><div style={{top: "-10px", position: "absolute"}}>About</div><div className="video-about-text-line-home"></div></div>
		</div>
	);
}

const VideoContainer = React.forwardRef((props, ref) => {
	return(
		<div ref={ref} className="video-container-home">
			<video autoPlay loop muted src={require('../../media/loop-behind-the-brand.mp4')}>
			</video>
			<VideoText />
			<AboutContainer />
		</div>
	);
});

class Home extends React.Component{
	constructor(props) {
		super(props);
		this.homeEle = null;
		this.picContainerEle = React.createRef();
		this.vidContainerEle = React.createRef();
		this.state = {scroll: 0};
		this.setHomeEle = element => {
			this.homeEle = element;
		}
		this.slideArr = [];
	}
	
	componentDidMount = () => {
		this.picContainerEle.current.childNodes.forEach( ele => {
				ele.docOffset = this.picContainerEle.current.offsetTop;
				this.slideArr.push(ele);
			}
		)
		this.vidContainerEle.current.childNodes.forEach( ele => {
				ele.docOffset = this.vidContainerEle.current.offsetTop;
				this.slideArr.push(ele);
			}
		)
	}

	debounce = (func, wait = 20, immediate = true) => {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	checkSlide = (sliderImages) => {
		this.slideArr.forEach(sliderImage => {
			let pageEle = this.homeEle;
			// half way through the image
			const slideInAt = (pageEle.scrollTop + window.innerHeight);
			// bottom of the image
			const imageBottom = sliderImage.docOffset + sliderImage.offsetTop + sliderImage.getBoundingClientRect().height;
			const isHalfShown = slideInAt > sliderImage.docOffset + sliderImage.offsetTop + sliderImage.getBoundingClientRect().height / 4;
			const isNotScrolledPast = pageEle.scrollTop < imageBottom;
			if (isHalfShown && isNotScrolledPast) {
				sliderImage.classList.add('active');
			} else {
				//sliderImage.classList.remove('active');
			}
		});
	}

	render() {

		return(
			<div ref={this.setHomeEle} className="home" onScroll={this.debounce(this.checkSlide)} >
				<Banner />
				<Top />
				<PictureContainer ref={this.picContainerEle} />
				<VideoContainer ref={this.vidContainerEle} />
			</div>
		);
	}
}

export default Home;


































