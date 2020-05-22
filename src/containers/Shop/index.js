import React from 'react';
import ReactDom from 'react-dom';
import "./index.scss";
import * as ys from "../../youspace.js";
//
import { Link } from "react-router-dom";
import data from "./data";

const Banner = (props) => {
	return(
		<div className="banner-shop">
			<Link className="banner-link-shop" to="/">Home</Link>
			<Link className="banner-link-shop" to="/collections">Collections</Link>
			<Link style={{fontWeight: "bold"}} className="banner-link-shop" to="/shop">Shop</Link>
		</div>
	);
}

const Top = (props) => {
	return(
		<div className="top-shop" >
			<div className="top-text-shop" style={{transform: "translateZ(-1px) scale(1.2)"}} >
				You’re looking for everything
				<br /> in all collection
			</div>
		</div>
	);
}

const ProductContainer = React.forwardRef((props, ref) => {
	return(
		<div ref={ref} className="product-container-shop">
			<div className="product-grid-shop">
				{data.product_list.map((product, i) => {
					return(
						<Link style={{textDecoration: "none"}} to={`/shop/${product.product_name.split(" ").join("-")}`} key={product.url} className="product-grid-item-shop">
							<div className="product-picture-shop"><img src={require(`../../media/shop/${product.url}`)}></img></div>
							<p className="product-name-shop">{`${product.product_name}`}</p>
							<div className="product-info-shop">{`${product.product_type}`}</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
});

class Shop extends React.Component{
	constructor(props) {
		super(props);
		this.shopEle = null;
		this.setShopEle = element => {
			this.shopEle = element;
		}
		this.productContainerEle = React.createRef();
		this.slideArr = [];
		this.state = { arr: null };
	}

	componentDidMount = () => {
		this.productContainerEle.current.childNodes[0].childNodes.forEach( (ele, index) => {
				ele.docOffset = this.productContainerEle.current.offsetTop;
				this.slideArr.push(ele);
				// if(index==0 || index==1 || index==2 || index==3)
				// 	ele.classList.add('active');
			}
		)
		// this.setState({arr: 1}, this.debounce(this.checkSlide));
		setTimeout(this.debounce(this.checkSlide), 100);
		
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
		// console.log("fewfw",this.productContainerEle.current.childNodes);
		//console.log(this.productContainerEle.current.childNodes[0].childNodes);
		//return;
		// let test = this.picContainerEle.current.childNodes;
		//let docOffset = this.picContainerEle.current.offsetTop;
		this.productContainerEle.current.childNodes[0].childNodes.forEach(sliderImage => {
			let pageEle = this.shopEle;
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
			<div ref={this.setShopEle} className="shop" onScroll={this.debounce(this.checkSlide)} >
				<Top />
				<Banner />
				<ProductContainer ref={this.productContainerEle} />
			</div>
		);
	}
}

export default Shop;

















