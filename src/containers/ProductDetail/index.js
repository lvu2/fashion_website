import React from 'react';
import "./index.scss";
//
import { Link } from "react-router-dom";
import data from './data';
var QRCode = require('qrcode.react');

const Banner = (props) => {
	return(
		<div className="banner-product-detail">
			<Link className="banner-link-product-detail"to="/">Home</Link>
			<Link style={{fontWeight: "bold"}} className="banner-link-product-detail"to="/collections">Collections</Link>
			<Link className="banner-link-product-detail"to="/shop">Shop</Link>
		</div>
	);
}

const SlideButtons = (props) => {
	return(
		<div className="buttons-container-product-detail">
			<div className="left-button-product-detail" onClick={props.handleLeft} >
				<div className="left-tri-line" >
				</div>
				<div className="left-tri-head" >
				</div>
			</div>
			<div className="right-button-product-detail" onClick={props.handleRight} >
				<div className="right-tri-line" >
				</div>
				<div className="right-tri-head" >
				</div>
			</div>
		</div>
	);
}

const ImageContainer = React.forwardRef((props, ref) => {
	const imgArr = props.data ? props.data.img_list : [];
	return(
		<div ref={ref} className={"image-container-product-detail"}>
			<div className={"image-main-list-container-product-detail"}>
			{imgArr.map((selectionImg, index) => {
				return(
					<img main-data-ind={index} className={index == 0 ? "selected" : "" } key={`main${selectionImg}`} src={require(`../../media/shop/${imgArr[index] ? imgArr[index] : "striped_kaftan_dress/D01_2048x2048.jpg"}`)}></img>
				);
			})}
			</div>
			<ul className={"image-list-product-detail"}>
				{imgArr.map((selectionImg, index) => {
					return(
						<li onClick={props.handleClick} className={index == 0 ? "selected" : "" } data-ind={index} key={selectionImg}><img src={require(`../../media/shop/${selectionImg}`)}></img></li>
					);
				})}
			</ul>
		</div>
	);
});

const InfoContainer = (props) => {
	const detailArr = props.data ? props.data.detail_list : [];
	const { product_name, sizes, colors, fits, price, qr_url } = props.data ? props.data : {};
	return(
		<div className={"info-container-product-detail"}>
			<h2 className={"title-product-detail"}>{product_name ?  product_name : ""}</h2>
			<div className={"size-product-detail"}><label>SIZE</label><div className={"choice"}>{sizes ?  sizes : ""}</div></div>
			<div className={"color-product-detail"}><label>COLOR</label><div className={"choice"}>{colors ?  colors : ""}</div></div>
			<div className={"fit-product-detail"}><label>FIT</label><div className={"choice"}>{fits ?  fits : ""}</div></div>
			<div className={"price-product-detail"}><label>USD</label><div className={"choice"}>{`$${price ?  price : ""}`}</div></div>
			<QRCode className={"qr-code-detail"} value={qr_url ?  qr_url : "https://www.bodylandmark.com/"} />
			<div className={"information-product-detail"}>
				<h2>More Details</h2>
				<ul className={"information-list-product-detail"}>
					{detailArr.map((detail) => {
						return(
							<li key={detail}>{detail}</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}

class ProductDetail extends React.Component{
	constructor(props) {
		super(props);
		this.state = { pageData: null, selectedInd: 0 };
		this.imgContainerEle = React.createRef();
	}
	
	componentDidMount = () => {
		// const myPageData = data[this.props.match.params.productName];
		const myPageData = data["products"][this.props.match.params.productName];
		this.setState({pageData: myPageData});	
	}

	handleImageSelect = (ele) => {
		if(ele.target.parentElement.getAttribute("data-ind") != null) {
			console.log(ele.target);
			const ind = ele.target.parentElement.getAttribute("data-ind");
			this.imgContainerEle.current.childNodes[1].childNodes[this.state.selectedInd].className = "";
			this.imgContainerEle.current.childNodes[1].childNodes[parseInt(ind)].className = "selected";

			this.imgContainerEle.current.childNodes[0].childNodes[this.state.selectedInd].className = "";
			this.imgContainerEle.current.childNodes[0].childNodes[parseInt(ind)].className = "selected";
			// this.imgContainerEle.current.childNodes[0].src = ele.target.src;
			this.setState({selectedInd: ind});
		}
	}

	render() {

		return(
			<div className={"product-detail"} >
				<ImageContainer ref={this.imgContainerEle} data={this.state.pageData ? this.state.pageData.image_container_data : null} handleClick={this.handleImageSelect} />
				<InfoContainer data={this.state.pageData ? this.state.pageData.product_container_data : null} />
				<SlideButtons />
				<Banner />
			</div>
		);
	}
}

export default ProductDetail;