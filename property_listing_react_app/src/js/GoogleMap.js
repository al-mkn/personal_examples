import React from 'react'
import PropTypes from 'prop-types'

class GoogleMap extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      markers: [],
    }

    this.populateMarkers = this.populateMarkers.bind(this)
  }

  populateMarkers(properties, map) {
    return properties.map(property => this.buildMarker(property, map))
  }

  buildMarker(property, map) {
    const { setActiveProperty, updateOpenMarker } = this.props

    const marker = new google.maps.Marker({
      position: { lat: property.latitude, lng: property.longitude },
      title: (property.index + 1).toString(),
      map: map,
      label: {
        color: '#ffffff',
        text: (property.index + 1).toString(),
      },
      icon: {
        url:
          'https://ihatetomatoes.net/react-tutorials/google-maps/images/img_map-marker.png',
        size: new google.maps.Size(22, 55),
        origin: new google.maps.Point(0, -15),
        anchor: new google.maps.Point(11, 52),
      },
    })

    marker.infoWindow = new google.maps.InfoWindow({
      content: `<h1>${property.address}`,
    })

    marker.propertyNumber = property.index

    marker.addListener('click', () => {
      setActiveProperty(property, true)
      updateOpenMarker(marker)
    })

    return marker
  }

  componentDidMount() {
    const { activeProperty, updateOpenMarker, properties } = this.props
    const { longitude, latitude, index } = activeProperty

    this.map = new google.maps.Map(this.refs.gmap, {
      center: { lat: latitude, lng: longitude },
      mapTypeControl: false,
      zoom: 15,
    })

    const markers = this.populateMarkers(properties, this.map)

    markers[index].infoWindow.open(this.map, markers[index])
    updateOpenMarker(markers[index])
    this.setState({ markers, openMarker: markers[index] })
  }

  componentDidUpdate(prevProps) {
    const {
      setActiveProperty,
      activeProperty,
      updateOpenMarker,
      properties,
    } = this.props

    if (this.props.properties !== prevProps.properties) {
      this.state.markers.forEach(marker => {
        marker.setMap(null)
      })

      const markers = this.populateMarkers(properties, this.map)
      markers[0].infoWindow.open(this.map, markers[0])
      updateOpenMarker(markers[0])
      setActiveProperty(properties[0])
      this.setState({ markers, openMarker: markers[0] })
    }

    if (this.props.activeProperty !== prevProps.activeProperty) {
      const openMarker = this.state.markers.find(
        marker => marker.propertyNumber === activeProperty.index
      )
      updateOpenMarker(openMarker)
      this.setState({ openMarker })
    }
  }

  render() {
    return (
      <div className="mapContainer">
        <div ref="gmap" id="map" />
      </div>
    )
  }
}

export default GoogleMap

GoogleMap.propTypes = {
  properties: PropTypes.array.isRequired,
  setActiveProperty: PropTypes.func.isRequired,
}
