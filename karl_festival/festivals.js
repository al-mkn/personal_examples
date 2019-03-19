/**
 * Created by al on 5/10/17.
 */

const festival_options = document.querySelector('#festival_selector')
const festival_search_btn = document.querySelector('#festival_search_button')
const artist_suggestion_field = document.querySelector('#artist_suggestion_input')
const artists_sel_container = document.querySelector('#artists_container')
const suggestion_list = document.querySelector('#artist_suggestions')
const spotify_button = document.querySelector('#festival_spotify_button')
let chosen_festival = localStorage.getItem('festival_key') || ''
let dates = ""

// user_id param is not in local storage, let's set it
if (!localStorage.getItem("user_id")) {

    localStorage.setItem("user_id", "{{ user_id }}" )

} else if (localStorage.getItem("user_id") && !localStorage.getItem("spotify_connected")) {

    // user_id does exist but user has not connected their spotify
    // need to update spotify connect button with the existing user_id param

    let url = "{{spotify_account_linking_url}}"
    let url_components = url.split('&amp;')
    let index;

    for (index in url_components) {
      let comp = url_components[index]
      if (comp.indexOf('state') !== -1) {
        let new_comp = 'state=' + localStorage.getItem('user_id')
        url_components[index] = new_comp
      }
    }

    url = url_components.join('&')
    document.querySelector('#festival_spotify_button').onclick = function(event) {
        location.href = url
    }

}

// is spotify connected already in localStorage?
if (localStorage.getItem("spotify_connected")) {
    // disable the spotify button
    spotify_button.setAttribute('disabled', 'disabled')
    spotify_button.textContent = 'Spotify Connected!'
    spotify_button.addEventListener('click', (e) => e.preventDefault())
}

// is spotify_connected in the url string and not in local storage?
if (window.location.search && !localStorage.getItem("spotify_connected")) {

    const spotify_connected = window.location.search.substring(1)
        .split("&")
        .filter( vars => vars.includes("spotify_connected"))[0]
        .split("=")
        .filter(val => val.includes("True"))[0]

    if (spotify_connected === "True") {
        // add spotify connected to localStorage
        localStorage.setItem("spotify_connected", "True" )
        // disable the spotify button
        spotify_button.setAttribute('disabled', 'disabled')
        spotify_button.textContent = 'Spotify Connected!'
        spotify_button.addEventListener('click', (e) => e.preventDefault())
    }

}

// is a festival already in localStorage?
if (localStorage.getItem("festival_key")) {
    const festival_key = localStorage.getItem("festival_key")
    // then set it in the selector
    festival_options.value = festival_key
} else {
    festival_options.value = ''
    festival_search_btn.setAttribute('disabled', 'disabled')
}

// are artists already selected?
if (localStorage.getItem("selected_artists")) {
    let selected_artists = localStorage.getItem("selected_artists")
    // todo
    // load them if they are
    selected_artists = JSON.parse(selected_artists)
    selected_artists.forEach( (e) => {
        const name = e['artist']
        const img_source = e['image']

        const artist_name = document.createElement('div')
        artist_name.textContent = name

        const remove_artist_button = document.createElement('button')
        remove_artist_button.textContent = 'X'
        remove_artist_button.className = 'remove_artist_button'
        remove_artist_button.addEventListener('click', remove_artist)

        const artist_block = document.createElement('div')
        artist_block.setAttribute('data-url', img_source)
        artist_block.title = name
        artist_block.className = 'artist_block'
        artist_block.style.backgroundImage = 'url(' + img_source + ')'
        artist_block.appendChild(artist_name)
        artist_block.appendChild(remove_artist_button)

        artists_sel_container.appendChild(artist_block)
    })

}

festival_options.addEventListener('change', function() {

    chosen_festival = festival_options.value
    localStorage.setItem("festival_key", chosen_festival )
    artists_sel_container.innerHTML = ""

    if (chosen_festival) {
        festival_search_btn.removeAttribute('disabled')
    } else {
        festival_search_btn.setAttribute('disabled', 'disabled')

    }

})

artist_suggestion_field.addEventListener('keyup', function() {

    if (!chosen_festival) {
        return
    }
    const search_term = this.value

    let url = '/festivals/artists_search?festival=' + chosen_festival + '&search_term=' + search_term

    // what are the current artists selected?
    let selected = []
    document.querySelectorAll('.artist_block')
        .forEach( (e) => {
            selected.push(e.title);
        })

    if (selected.length) {
        url += '&selected=' + selected.join(',')
    }

    document.querySelectorAll('.artist_suggestion')
        .forEach( (e) => {
            e.parentNode.removeChild(e);
        })

    if(search_term) {

        // full opacity background
        document.querySelector('#artist_suggestions').style.backgroundColor = "rgba(255,255,255,1)"
        document.querySelector('#artist_suggestions').style.visibility = "visible"

        fetch(url)
            .then( response => response.json() )
            .then( data => {

                data.map( a_obj => {

                    const name = a_obj.artist
                    const img_source = a_obj.source

                    const suggestion = document.createElement('div');
                    suggestion.textContent = name
                    suggestion.className = 'artist_suggestion'

                    suggestion_list.appendChild(suggestion)

                })
            })
            .then( () => {

                if (document.body.addEventListener) {
                    document.body.addEventListener('click',add_artist,false)
                } else {
                    document.body.attachEvent('onclick',add_artist) //for IE
                }

            })

    } else {

        // rehide if input is empty
        document.querySelector('#artist_suggestions').style.visibility = "hidden"

    }
})

festival_search_btn.addEventListener('click', function() {


    const festivals_landing = document.querySelector('#festivals_landing')
    const festivals_results = document.querySelector('#festivals_results')
    const chosen_festival = festival_options.value
    const selected_option = festival_options.options[festival_options.selectedIndex]
    dates = eval(selected_option.getAttribute('data-dates'))
    const artists = [].slice.call(document.querySelectorAll('.selected_artist'))
        .map( node => node.title)
    const storage_artists = [].slice.call(document.querySelectorAll('.selected_artist'))
        .map( node => ({'artist':node.title, 'image':node.src}))
    const moods = [].slice.call(document.querySelectorAll('.mood_range'))
        .map( node => node.value)
    const modal = document.querySelector('.loading_modal')

    localStorage.setItem( "selected_artists", JSON.stringify(storage_artists) )

    let data = {
        'festival': chosen_festival,
        'dates': dates,
        'must_see': artists,
        'popularity': moods[0],
        'time_of_day': moods[1],
        'pace': moods[2],
        'user_id': localStorage.getItem("user_id")
    }

    data = JSON.stringify(data)

    if (chosen_festival) {

        const request = new Request('/festivals/search', {method: 'POST', body: data});
        modal.classList.toggle('show_modal')

        fetch(request)
            .then( response =>  response.text() )
            .then( html =>  festivals_results.innerHTML = html )
            .then( () => {

                if (document.body.addEventListener) {
                    document.body.addEventListener('click',toggle_search_results,false)
                    document.body.addEventListener('click',select_festival_day,false)
                } else { //for IE
                    document.body.attachEvent('onclick',toggle_search_results)
                    document.body.attachEvent('onclick',select_festival_day)
                }

            })
            .then( () => {

                festivals_landing.classList.toggle('festivals_hidden')
                festivals_results.classList.toggle('festivals_hidden')
                modal.classList.toggle('show_modal')
                scroll(0,0)

            })

    }

})

function add_artist(e) {

    e = e || window.event;
    const target = e.target || e.srcElement
    const search_term = target.textContent

    // back to transparent background
    // document.querySelector('#artist_suggestions').style.backgroundColor = "rgba(255,255,255,0)"
    document.querySelector('#artist_suggestions').style.visibility = "hidden"

    if (target.className.match(/artist_suggestion/)) {

        const url = '/festivals/artist_add?festival=' + chosen_festival + '&search_term=' + search_term

        document.querySelectorAll('.artist_suggestion')
            .forEach( (e) => {
                e.parentNode.removeChild(e);
            })

        fetch(url)
            .then( response => response.json() )
            .then( data => {add_artist
                data.map( a_obj => {

                    const name = a_obj.artist
                    const img_source = a_obj.source

                    const artist_name = document.createElement('div')
                    artist_name.textContent = name

                    const remove_artist_button = document.createElement('button')
                    remove_artist_button.textContent = 'X'
                    remove_artist_button.className = 'remove_artist_button'
                    remove_artist_button.addEventListener('click', remove_artist)

                    const artist_block = document.createElement('div')
                    artist_block.setAttribute('data-url', img_source)
                    artist_block.title = name
                    artist_block.className = 'artist_block'
                    artist_block.style.backgroundImage = 'url(' + img_source + ')'
                    artist_block.appendChild(artist_name)
                    artist_block.appendChild(remove_artist_button)

                    artists_sel_container.appendChild(artist_block)

                    // also add them to localStorage
                    const storage_artists = [].slice.call(document.querySelectorAll('.artist_block'))
                        .map( node => ({'artist':node.title, 'image':node.getAttribute('data-url')}))

                    localStorage.setItem( "selected_artists", JSON.stringify(storage_artists) )

                })
            })
            .then( () => {

                if (document.body.addEventListener) {
                    document.body.addEventListener('click',select_artist,false)
                } else {
                    document.body.attachEvent('onclick',select_artist) //for IE
                }

            })

    }

}

function select_artist(e) {

    e = e || window.event;
    const target = e.target || e.srcElement

    if (target.className.match(/festivals_artist_block/)) {

        target.classList.toggle('artist_block')
        target.classList.toggle('selected_artist')

    }

}

function remove_artist(e) {

    e = e || window.event;
    const target = e.target || e.srcElement

    // 'x' button was clicked, let's remote parent Element (which is artist div)
    target.parentElement.remove()

    // also update localStorage with new list
    const storage_artists = [].slice.call(document.querySelectorAll('.artist_block'))
        .map( node => ({'artist':node.title, 'image':node.getAttribute('data-url')}))

    localStorage.setItem( "selected_artists", JSON.stringify(storage_artists) )

}

function toggle_search_results(e) {

    e = e || window.event;
    const target = e.target || e.srcElement
    const landing = document.querySelector('#festivals_landing')
    const results = document.querySelector('#festivals_results')

    if (target.id.match(/festivals_edit_search/)) {

        landing.classList.toggle('festivals_hidden')
        results.classList.toggle('festivals_hidden')
        results.innerHTML = ""
        scroll(0,0)

    }

}

function select_festival_day(e) {

    e = e || window.event;
    const target = e.target || e.srcElement

    if (target.className.match(/festival_date/) && !(target.className.match(/active_date/)) ) {

        const active = document.querySelector('.active_date')
        const date = target.innerText
        // const date = target.getAttribute('data-date')

        const lineups = document.querySelectorAll('.lineup_day')
        lineups.forEach( element => {
            const container_date = element.getAttribute('data-date')

            if (element.classList.contains("active_day")) {
                element.classList.toggle('active_day')
            }

            if (date == container_date) {
                element.classList.toggle('active_day')
            }

        })

        target.classList.toggle('active_date')
        active.classList.toggle('active_date')

    }

}
