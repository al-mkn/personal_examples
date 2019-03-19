import React from 'react'
import data from './data/Data'
import Card from './Card'
import Header from './Header'
import GoogleMap from './GoogleMap'
import jump from 'jump.js'
import { easeInOutCubic } from './utils/Easing'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      properties: data.properties,
      visibleProperties: data.properties,
      activeProperty: data.properties[0],
      isFilterVisible: false,
      openMarker: null,
      filtered: {
        bedrooms: 'any',
        bathrooms: 'any',
        carSpaces: 'any',
        priceFrom: 'any',
        priceTo: 'any',
        sortListings: 'default',
      },
    }

    this.setActiveProperty = this.setActiveProperty.bind(this)
    this.updateOpenMarker = this.updateOpenMarker.bind(this)
    this.toggleFilter = this.toggleFilter.bind(this)
    this.filterProperties = this.filterProperties.bind(this)
    this.clearFilter = this.clearFilter.bind(this)
  }

  filterProperties(e) {
    const target = e.target
    const { value, name } = target
    const { filtered } = this.state
    let visibleProperties = [...this.state.properties]
    value === 'any' || name === 'sortListings'
      ? (filtered[name] = value)
      : (filtered[name] = Number(value))
    this.setState({ filtered })

    visibleProperties = visibleProperties.filter(property => {
      const { bedrooms, bathrooms, carSpaces, price } = property
      return (
        (filtered.bedrooms === 'any' || bedrooms === filtered.bedrooms) &&
        (filtered.bathrooms === 'any' || bathrooms === filtered.bathrooms) &&
        (filtered.carSpaces === 'any' || carSpaces === filtered.carSpaces) &&
        (filtered.priceFrom === 'any' || price >= filtered.priceFrom) &&
        (filtered.priceTo === 'any' || price <= filtered.priceTo)
      )
    })

    if (filtered.sortListings === 'default') {
      visibleProperties.sort((a, b) => Number(a.index) - Number(b.index))
    }
    if (filtered.sortListings === 'ascending') {
      visibleProperties.sort((a, b) => Number(a.price) - Number(b.price))
    }
    if (filtered.sortListings === 'descending') {
      visibleProperties.sort((a, b) => Number(b.price) - Number(a.price))
    }

    this.setState({ visibleProperties })
  }

  toggleFilter(e) {
    e.preventDefault()
    this.setState({ isFilterVisible: !this.state.isFilterVisible })
  }

  clearFilter(e, form) {
    e.preventDefault()
    const filtered = {
      bedrooms: 'any',
      bathrooms: 'any',
      carSpaces: 'any',
      priceFrom: 'any',
      priceTo: 'any',
      sortListings: 'default',
    }
    this.setState({ filtered, visibleProperties: this.state.properties })
    form.reset()
  }

  updateOpenMarker(marker) {
    if (this.state.openMarker !== null) {
      this.state.openMarker.infoWindow.close()
    }
    marker.infoWindow.open(map, marker)
    this.setState({ openMarker: marker })
  }

  setActiveProperty(property, willScroll) {
    this.setState({ activeProperty: property })
    if (willScroll) {
      jump(`#card-${property._id}`, {
        duration: 800,
        offset: 0,
        easing: easeInOutCubic,
      })
    }
  }

  render() {
    const { visibleProperties, activeProperty, isFilterVisible } = this.state

    return (
      <div>
        <div className="listings">
          <Header
            isFilterVisible={isFilterVisible}
            clearFilter={this.clearFilter}
            toggleFilter={this.toggleFilter}
            filterProperties={this.filterProperties}
          />

          <div className="cards container">
            <div className="cards-list row ">
              {visibleProperties.map(property => {
                return (
                  <Card
                    setActiveProperty={this.setActiveProperty}
                    updateOpenMarker={this.updateOpenMarker}
                    key={property._id}
                    property={property}
                    activeProperty={activeProperty}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <GoogleMap
          properties={visibleProperties}
          activeProperty={activeProperty}
          setActiveProperty={this.setActiveProperty}
          updateOpenMarker={this.updateOpenMarker}
        />
      </div>
    )
  }
}

export default App
