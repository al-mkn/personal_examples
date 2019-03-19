import React from 'react'
import PropTypes from 'prop-types'
import * as Formatters from './utils/Formatters'

/*
        "_id": "593e9297e17df20c4a237d42",
        "index": 0,
        "price": 937180,
        "picture": "https://ihatetomatoes.net/demos/_rw/01-real-estate/tn_property01.jpg",
        "city": "Singer",
        "address": "914 Argyle Road",
        "latitude": -33.944576,
        "longitude": 151.25584,
        "bedrooms": 2,
        "bathrooms": 2,
        "carSpaces": 2
    */

const Card = ({ property, activeProperty, setActiveProperty }) => {
  const {
    _id,
    picture,
    price,
    index,
    city,
    address,
    bedrooms,
    bathrooms,
    carSpaces,
  } = property

  return (
    <div
      onClick={() => setActiveProperty(property, false)}
      id={`card-${_id}`}
      className={`card col-sm-12 col-md-6 col-lg-4 ${
        property === activeProperty ? 'is-active' : ''
      }`}
    >
      <img src={picture} alt="Bend" />
      <p className="price">{Formatters.price(price)}</p>
      <div className="details">
        <span className="index">{(index + 1).toString()}</span>
        <p className="location">
          {city}
          <br />
          {address}
        </p>
        <ul className="features">
          <li className="icon-bed">
            {bedrooms}
            <span>bedrooms</span>
          </li>
          <li className="icon-bath">
            {bathrooms}
            <span>bathrooms</span>
          </li>
          <li className="icon-car">
            {carSpaces}
            <span>parking spots</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

Card.PropTypes = {
  property: PropTypes.object.isRequired,
  setActiveProperty: PropTypes.func.isRequired,
}

export default Card
