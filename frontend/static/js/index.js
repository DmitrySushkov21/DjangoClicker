async function getUser(id) {
    let response = await fetch('/users/' + id, {
        method: 'GET'
    });
    let answer = await response.json();
    document.getElementById("user").innerHTML = answer['username'];
    let getCycle = await fetch('/cycles/' + answer['cycle'], {
        method: 'GET'
    });
    let cycle = await getCycle.json();
    document.getElementById("data").innerHTML = cycle['coinsCount'];
    document.getElementById("clickPower").innerHTML = cycle['clickPower'];
    let boost_request = await fetch('/boosts/' + answer.cycle, {
        method: 'GET'
    })
    let boosts = await boost_request.json()
    render_all_boosts(boosts)
    boost_access()
    set_auto_click()
    set_send_coins_interval()
}

async function callClick() {
    let response = await fetch('/click/', {
        method: 'GET'
    });
    let answer = await response.json();
    document.getElementById("data").innerHTML = answer.coinsCount;
    if (answer.boosts)
        render_all_boosts(answer.boosts);
    boosts_access()
}

function buyBoost(boost_level) {
    let boost_price;
    let coins = BigInt(document.getElementById('data').innerHTML)
    let boost = document.getElementById('boostPrice_' + boost_level)
    if (boost !== null)
        boost_price = BigInt(boost.innerHTML)
    else
        boost_price = 10
    if (coins >= boost_price) {
        const csrftoken = getCookie('csrftoken')
        fetch('/buyBoost/', {
            method: 'POST',
            headers: {
                "X-CSRFToken": csrftoken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                boost_level: boost_level
            })
        }).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return Promise.reject(response)
            }
        }).then(data => {
            console.log(data['boost_type'])
            if (data['boost_type'] === 1) {
                let c_lvl = 'boostLevel_' + data['level']
                let c_power = 'boostPower_' + data['level']
                let c_price = 'boostPrice_' + data['level']
                document.getElementById(c_power).innerHTML = data['power'];
                document.getElementById(c_lvl).innerHTML = data['level'];
                document.getElementById(c_price).innerHTML = data['price'];
            } else {
                document.getElementById("autoClickPower").innerHTML = data['autoClickPower'];
            }
            document.getElementById("data").innerHTML = data['coinsCount'];
            document.getElementById("clickPower").innerHTML = data['clickPower'];

        })
    }
    boost_access()
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function render_all_boosts(boosts) {
    let parent = document.getElementById('boost-wrapper')
    if (parent.children.length > 1)
        parent.innerHTML = ''
    boosts.forEach(boost => {
        render_boost(parent, boost)
    })
    if (parent.children.length > 1)
        document.getElementById('boost-holder').remove()
}

function render_boost(parent, boost) {
    let div = document.createElement('div')
    div.setAttribute('class', 'boost-holder')
    div.setAttribute('id', `boost-holder-${boost.level}`)
    if (boost.boost_type === 1) {
        div.innerHTML = `
                <div class="item-1">
                    <input id="buy_img" type="image" style="height: 145px; width: 150px; border-radius: 20px" src="https://i.ytimg.com/vi/aD-fFyGvDW8/maxresdefault.jpg"
                           "/>
                </div>
                <div class="item-2">
                    <div class="box-1">
                       <div>Сила АБОБЫ:
                            <div id="boostPower_${boost.level}">${boost.power}</div>
                       </div>
                        <div>Купи эту АБОБУ за
                            <div id="boostPrice_${boost.level}">${boost.price}</div>
                       </div>
                    </div>
                    <div class="box-2">
                        <div>Уровень АБОБАбуста<div id="boostLevel_${boost.level}">${boost.level}</div></div>
                    </div>
                </div>
  `
    } else {
        div.innerHTML = `
                <div class="item-1">
                    <input id="buy_img" class="buy_img" type="image" style="height: 145px; width: 150px;" src="https://yt3.ggpht.com/a/AATXAJwjkbDMPkUsiRnygiGs4iBZIbJMYLFYt3nXoqzr-w=s900-c-k-c0xffffffff-no-rj-mo"
                           "/>
                </div>
                <div class="item-2">
                    <div class="box-1">
                       <div>Сила АБОБЫ:
                            <div id="boostPower_${boost.level}">АВТОАБОБА(бесконечность)</div>
                       </div>
                        <div>Купи эту АБОБУ за
                            <div id="boostPrice_${boost.level}">${boost.price}</div>
                       </div>
                    </div>
                    <div class="box-2">
                        <div>Уровень АБОБАбуста<div id="boostLevel_${boost.level}">${boost.level}</div></div>
                    </div>
                </div>
  `
    }
    div.onclick = function () {
        buyBoost(boost.level)
    }
    parent.appendChild(div)
}

function boost_access() {
    let coins_count = BigInt(document.getElementById('data').innerHTML)
    let boosts = document.getElementById('boost-wrapper')
    for (const boost of boosts.children) {
        let boostPrice = BigInt(boost.children[1].children[0].children[1].children[0].innerHTML)
        if (coins_count < boostPrice)
            boost.classList.add("disabled")
        else
            boost.classList.remove("disabled")
    }
}


function set_auto_click() {
    setInterval(function () {
        const coins_counter = document.getElementById('data')
        let coins_value = BigInt(coins_counter.innerText)

        const auto_click_power = document.getElementById('autoClickPower').innerText
        coins_value += BigInt(auto_click_power)
        document.getElementById("data").innerHTML = coins_value;
    }, 1000)
}

function set_send_coins_interval() {
    setInterval(function () {
        const csrftoken = getCookie('csrftoken')
        const coins_counter = document.getElementById('data').innerText
        fetch('/set_maincycle/', {
            method: 'POST',
            headers: {
                "X-CSRFToken": csrftoken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coinsCount: coins_counter,
            })
        }).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return Promise.reject(response)
            }
        }).then(_ => {
            boost_access()
        }).catch(err => console.log(err))
    }, 10000)
}