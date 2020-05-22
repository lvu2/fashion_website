import React from 'react';
import "./index.scss";
//
import { Link } from "react-router-dom";
import data from './data';

const Banner = (props) => {
	return(
		<div className="banner-collection-detail">
			<Link style={{color: `${props.pageData ? props.pageData.top_container_data.font_color : "white"}`}} className="banner-link-collection-detail" to="/">Home</Link>
			<Link style={{fontWeight: "bold", color: `${props.pageData ? props.pageData.top_container_data.font_color : "white"}`}} className="banner-link-collection-detail" to="/collections">Collections</Link>
			<Link style={{color: `${props.pageData ? props.pageData.top_container_data.font_color : "white"}`}} className="banner-link-collection-detail" to="/shop">Shop</Link>
		</div>
	);
}

const TopImage = (props) => {
	return(
		<div className="top-image-collection-detail">
			<img src={require(`../../media/collections/${props.containerData ? props.containerData.top_image_url : "fall-winter-19-20/Collection-Cover(5).jpg"}`)}></img>
		</div>
	);
}

const TopText = (props) => {
	return(
		<div style={{color: `${props.containerData ? props.containerData.font_color : "white"}`}} className="top-text-collection-detail">
			<div className="main-upper-text-collection-detail">{props.containerData ? props.containerData.top_main_upper_text : null}</div>
			<div className="main-lower-text-collection-detail">{props.containerData ? props.containerData.top_main_lower_text : null}</div>
			<sup className="main-year-collection-detail">{props.containerData ? props.containerData.top_main_year : null}</sup>
		</div>
	);
}

const Top = (props) => {
	return(
		<div className="top-container-collection-detail">
			<TopImage containerData={props.pageData ? props.pageData.top_container_data : null} />
			<TopText containerData={props.pageData ? props.pageData.top_container_data : null} />
		</div>
	);
}

const Slide = React.forwardRef((props, ref) => {
	const leftSlideArr = props.slideData ? props.slideData.left_slide_list : [];
	const rightSlideArr = props.slideData ? props.slideData.right_slide_list : [];
	return(
		<div ref={ref} className="slide-page-section-collection-detail">
			<div className="slide-container-collection-detail">
				<div data-scrollanimate={true} className="slide-left" >
					{leftSlideArr.map((product, i) => {
						return(
							<div style={{top: `${100*i}%`}} key={product} className="slide-product-container">
								<img src={require(`../../media/collections/${product}`)}></img>
							</div>
						);
					})}
				</div>
				<div data-scrollanimate={true} className="slide-right" >
					{rightSlideArr.map((product, i) => {
						return(
							<div style={{top: `${-100*i}%`}} key={product} className="slide-product-container">
								<img src={require(`../../media/collections/${product}`)}></img>
							</div>
						);
					})}
				</div>
				<div className="slide-buttons-container">
					<div className="slide-left-button-container" onClick={props.handleLeft} >
						<div className="left-tri-line" >
						</div>
						<div className="left-tri-head" >
						</div>
					</div>
					<div className="slide-right-button-container" onClick={props.handleRight} >
						<div className="right-tri-line" >
						</div>
						<div className="right-tri-head" >
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

const About = React.forwardRef((props, ref) => {
	return(
		<div ref={ref} className="about-section-collection-detail">
			<div data-scrollanimate={true} className="upper-container"><img src={require(`../../media/collections/${props.aboutData ? props.aboutData.upper_image_url : "fall-winter-19-20/home-3.jpg"}`)}></img></div>
			<div data-scrollanimate={true} className="about-text">
				<h1 className="title">About the Collection</h1>
				<p className="description">{props.aboutData ? props.aboutData.about_text : ""}</p>
			</div>
			<div data-scrollanimate={true} className="lower-container"><img src={require(`../../media/collections/${props.aboutData ? props.aboutData.lower_image_url : "fall-winter-19-20/home-3.jpg"}`)}></img></div>
		</div>
	);
});

const Inspiration = React.forwardRef((props, ref) => {
	return(
		<div ref={ref} className="inspiration-section-collection-detail">
			<div data-scrollanimate={true} className="inspiration-image-container"><img src={require(`../../media/collections/${props.inspirationData ? props.inspirationData.image_url : "fall-winter-19-20/INSPIRATION_collection-inspiration_1260_850_crop.png"}`)}></img></div>
			<div className="inspiration-text">
				<h1 className="title">The Inspiration</h1>
				<p className="description">{props.inspirationData ? props.inspirationData.inspiration_text : ""}</p>
			</div>
		</div>
	);
});

class CollectionDetail extends React.Component{
	constructor(props) {
		super(props);
		this.state = { pageData: null, slideYPos: 0 };
		this.slideEle = React.createRef();
		this.aboutEle = React.createRef();
		this.inspirationEle = React.createRef();
		this.CollectionDetailEle = null;
		this.setCollectionDetailEle = element => {
			this.colectionDetailEle = element;
		}
		this.slideArr = [];
	}
	
	componentDidMount = () => {
		this.aboutEle.current.childNodes.forEach( ele => {
				if(ele.getAttribute("data-scrollanimate")) {
					ele.docOffset = this.aboutEle.current.offsetTop;
					this.slideArr.push(ele);
				}
			}
		)
		this.inspirationEle.current.childNodes.forEach( ele => {
				if(ele.getAttribute("data-scrollanimate")) {
					ele.docOffset = this.inspirationEle.current.offsetTop;
					this.slideArr.push(ele);
				}
			}
		)
		this.slideEle.current.childNodes[0].childNodes.forEach( ele => {
				if(ele.getAttribute("data-scrollanimate")) {
					ele.docOffset = this.slideEle.current.offsetTop + this.slideEle.current.childNodes[0].offsetTop;
					this.slideArr.push(ele);
				}
			}
		)
		const myPageData = data[this.props.match.params.collectionName];
		this.setState({pageData: myPageData});

	}

	handleRight = (event) => {
		if( this.state.slideYPos >= this.slideEle.current.childNodes[0].childNodes[0].childNodes.length - 1
			|| this.state.slideYPos >= this.slideEle.current.childNodes[0].childNodes[1].childNodes.length - 1 )
			return;
		this.slideEle.current.childNodes[0].childNodes[0].childNodes.forEach( productEle => {
			productEle.style.transform = `translateY(-${100 * (this.state.slideYPos + 1)}%)`;
		});
		this.slideEle.current.childNodes[0].childNodes[1].childNodes.forEach( productEle => {
			productEle.style.transform = `translateY(${100 * (this.state.slideYPos + 1)}%)`;
		});
		this.setState({ slideYPos: this.state.slideYPos + 1 });
	}

	handleLeft = (event) => {
		if( this.state.slideYPos <= 0 )
			return;
		this.slideEle.current.childNodes[0].childNodes[0].childNodes.forEach( productEle => {
			productEle.style.transform = `translateY(-${100 * (this.state.slideYPos - 1)}%)`;
		});
		this.slideEle.current.childNodes[0].childNodes[1].childNodes.forEach( productEle => {
			productEle.style.transform = `translateY(${100 * (this.state.slideYPos - 1)}%)`;
		});
		this.setState({ slideYPos: this.state.slideYPos - 1 });
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
			let pageEle = this.colectionDetailEle;
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
			<div className={"collection-detail"} ref={this.setCollectionDetailEle} onScroll={this.debounce(this.checkSlide)} >
				<Banner pageData={this.state.pageData} />
				<Top pageData={this.state.pageData} />
				<Slide ref={this.slideEle} handleRight={this.handleRight} handleLeft={this.handleLeft} slideData={this.state.pageData ? this.state.pageData.slide_container_data : null}/>
				<About ref={this.aboutEle} aboutData={this.state.pageData ? this.state.pageData.about_container_data : null}/>
				<Inspiration ref={this.inspirationEle} inspirationData={this.state.pageData ? this.state.pageData.inspiration_container_data : null} />
			</div>
		);
	}
}

export default CollectionDetail;























