
let page = 'main';

let map_size;

const tribes_list = ['Xin-xi', 'Imperius', 'Bardur', 'Oumaji', 'Kickoo', 'Hoodrick', 'Luxidoor', 'Vengir', 'Zebasi',
    'Ai-mo', 'Quetzali', 'Yadakk', 'Aquarion', 'Elyrion', 'Polaris'];
const terrain = ['forest', 'fruit', 'game', 'ground', 'mountain'];
const general_terrain = ['crop', 'fish', 'metal', 'ocean', 'ruin', 'village', 'water', 'whale'];
const _____ = 2;
const ____ = 1.5;
const ___ = 1;
const __ = 0.5;
const _ = 0.1;
const BORDER_EXPANSION = 1/3;
const terrain_probs = {'water': {'Xin-xi': 0, 'Imperius': 0, 'Bardur': 0, 'Oumaji': 0, 'Kickoo': 0.4, 'Hoodrick': 0, 'Luxidoor': 0,
                        'Vengir': 0, 'Zebasi': 0, 'Ai-mo': 0, 'Quetzali': 0, 'Yadakk': 0, 'Aquarion': 0.3, 'Elyrion': 0},
                    'forest': {'Xin-xi': ___, 'Imperius': ___, 'Bardur': ___, 'Oumaji': _, 'Kickoo': ___, 'Hoodrick': ____, 'Luxidoor': ___,
                        'Vengir': ___, 'Zebasi': __, 'Ai-mo': ___, 'Quetzali': ___, 'Yadakk': __, 'Aquarion': __, 'Elyrion': ___},
                    'mountain': {'Xin-xi': ____, 'Imperius': ___, 'Bardur': ___, 'Oumaji': ___, 'Kickoo': __, 'Hoodrick': __, 'Luxidoor': ___,
                        'Vengir': ___, 'Zebasi': __, 'Ai-mo': ____, 'Quetzali': ___, 'Yadakk': __, 'Aquarion': ___, 'Elyrion': __},
                    'metal': {'Xin-xi': ___, 'Imperius': ___, 'Bardur': ___, 'Oumaji': ___, 'Kickoo': ___, 'Hoodrick': ___, 'Luxidoor': ___,
                        'Vengir': _____, 'Zebasi': ___, 'Ai-mo': ___, 'Quetzali': _, 'Yadakk': ___, 'Aquarion': ___, 'Elyrion': ___},
                    'fruit': {'Xin-xi': ___, 'Imperius': ___, 'Bardur': ____, 'Oumaji': ___, 'Kickoo': ___, 'Hoodrick': ___, 'Luxidoor': _____,
                        'Vengir': _, 'Zebasi': __, 'Ai-mo': ___, 'Quetzali': _____, 'Yadakk': ____, 'Aquarion': ___, 'Elyrion': ___},
                    'crop': {'Xin-xi': ___, 'Imperius': ___, 'Bardur': _, 'Oumaji': ___, 'Kickoo': ___, 'Hoodrick': ___, 'Luxidoor': ___,
                        'Vengir': ___, 'Zebasi': ___, 'Ai-mo': _, 'Quetzali': _, 'Yadakk': ___, 'Aquarion': ___, 'Elyrion': ____},
                    'game': {'Xin-xi': ___, 'Imperius': ___, 'Bardur': _____, 'Oumaji': ___, 'Kickoo': ___, 'Hoodrick': ___, 'Luxidoor': __,
                        'Vengir': _, 'Zebasi': ___, 'Ai-mo': ___, 'Quetzali': ___, 'Yadakk': ___, 'Aquarion': ___, 'Elyrion': ___},
                    'fish': {'Xin-xi': ___, 'Imperius': ___, 'Bardur': ___, 'Oumaji': ___, 'Kickoo': ____, 'Hoodrick': ___, 'Luxidoor': ___,
                        'Vengir': _, 'Zebasi': ___, 'Ai-mo': ___, 'Quetzali': ___, 'Yadakk': ___, 'Aquarion': ___, 'Elyrion': ___},
                    'whale': {'Xin-xi': ___, 'Imperius': ___, 'Bardur': ___, 'Oumaji': ___, 'Kickoo': ___, 'Hoodrick': ___, 'Luxidoor': ___,
                        'Vengir': ___, 'Zebasi': ___, 'Ai-mo': ___, 'Quetzali': ___, 'Yadakk': ___, 'Aquarion': ___, 'Elyrion': ___}};
const general_probs = {'mountain': 0.15, 'forest': 0.4, 'fruit': 0.5, 'crop': 0.5, 'fish': 0.5, 'game': 0.5, 'whale': 0.4, 'metal': 0.5};

let assets = [];
let get_assets = new Promise(resolve => {
    for (let tribe of tribes_list) {
        assets[tribe] = [];
    }
    for (let g_t of general_terrain) {
        assets[g_t] = get_image("assets/" + g_t + ".png");
    }
    for (let tribe of tribes_list) {
        for (let terr of terrain) {
            assets[tribe][terr] = get_image("assets/" + tribe + "/" + tribe + " " + terr + ".png");
        }
        assets[tribe]['capital'] = get_image("assets/" + tribe + "/" + tribe + " head.png");
    }
    resolve();
});

function onload() {
    get_assets.then(() => {
        generate();
    })
}

function switch_page(new_page) {
    document.getElementById("main").style.display='none';
    document.getElementById("faq").style.display='none';
    page = new_page;
    document.getElementById(new_page).style.display='block';
}

function get_image(src) {
    let image = new Image();
    image.src = src;
    return image;
}

function generate() {
    map_size = parseInt(document.getElementById("map_size").value);
    if (map_size < 5 || map_size !== Math.floor(map_size)) {
        document.getElementById("warning").innerText = 'Warning: Map size must be integer at least 5.';
        document.getElementById("warning").style.display='block';
        return;
    }

    let initial_land = parseFloat(document.getElementById("initial_land").value);
    if (initial_land < 0 || initial_land > 1) {
        document.getElementById("warning").innerText = 'Warning: Initial land must be float between 0 and 1.';
        document.getElementById("warning").style.display='block';
        return;
    }

    let smoothing = parseInt(document.getElementById("smoothing").value);
    if (smoothing < 0 || smoothing !== Math.floor(smoothing)) {
        document.getElementById("warning").innerText = 'Warning: Smoothing must be integer at least 0.';
        document.getElementById("warning").style.display='block';
        return;
    }

    let relief = parseInt(document.getElementById("relief").value);
    if (relief < 1 || relief > 8 || relief !== Math.floor(relief)) {
        document.getElementById("warning").innerText = 'Warning: Relief must be integer between 1 and 8.';
        document.getElementById("warning").style.display='block';
        return;
    }

    let tribes = document.getElementById("tribes").value;
    tribes = tribes.split(" ");
    for (let tribe of tribes) {
        if (!tribes_list.includes(tribe)) {
            document.getElementById("warning").innerText = 'Warning: list tribes in pick-order separating with spaces.';
            document.getElementById("warning").style.display='block';
            return;
        }
    }

    let fill = document.getElementById("fill").value;
    if (fill !== '') {
        if (!tribes_list.includes(fill)) {
            document.getElementById("warning").innerText = 'Warning: there is no such a tribe.';
            document.getElementById("warning").style.display='block';
            return;
        }
    }

    document.getElementById("warning").style.display='none';

    // let the show begin
    console.time('Initial map');
    let land_coefficient = (0.5 + relief) / 9;
    let map = new Array(map_size**2);

    
    console.time('Display');
    display_map(map);
    console.timeEnd('Display');
    console.log('_______________________');
    console.log('Number of villages: ' + village_count);
    console.log('Number of ruins: ' + ruins_number);
    console.log('_______________________');

    // display text-map if necessary
    let text_output_check = document.getElementById("text_output_check").checked;
    if (text_output_check)
        print_map(map);
    else
        document.getElementById("text_display").style.display='none';
}

// we use pythagorean distances
function distance(a, b, size) {
    let ax = a % size;
    let ay = a / size | 0;
    let bx = b % size;
    let by = b / size | 0;
    return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

function print_map(map) {
    let seen_grid = Array(map_size**2 * 4);
    for (let i = 0; i < map_size**2 * 4; i++) {
        seen_grid[i] = '-';
    }
    for (let i = 0; i < map_size**2; i++) {
        let row = Math.floor(i / map_size);
        let column = i % map_size;
        seen_grid[map_size - 1 + column - row + (column + row) * map_size * 2] = map[row * map_size + column]['type'][0];
    }
    let output = '';
    for (let i = 0; i < map_size * 2; i++) {
        output += seen_grid.slice(i * map_size * 2, (i + 1) * map_size * 2).join('');
        output += '\n'
    }

    document.getElementById("text_display").innerText = output;
    document.getElementById("text_display").style.display='block';
}

// better ignore this part; broken assets turn map display into a mess with a ton of exceptions
function display_map(map) {
    for (let i = 0; i < map_size**2; i++) {
        map[i] = {type: 'ground', above: null, road: false, tribe: fill ? fill : 'Xin-xi'}; // tribes don't matter so far
    }
    let graphic_display = document.getElementById("graphic_display");
    graphic_display.width = graphic_display.width + 0;
    let canvas = graphic_display.getContext("2d");

    let tile_size = 1000 / map_size;

    let tile_height = assets['Xin-xi']['ground'].height;
    let tile_width = assets['Xin-xi']['ground'].width;
    for (let i = 0; i < map_size**2; i++) {
        let row = i / map_size | 0;
        let column = i % map_size;
        let x = 500 - tile_size / 2 + (column - row) * tile_size / 2;
        let y = (column + row) * tile_height * tile_size / tile_width / 1908 * 606;
        let type = map[row * map_size + column]['type'];
        let above = map[row * map_size + column]['above'];
        let tribe = map[row * map_size + column]['tribe'];
        if (general_terrain.includes(type)) {
            canvas.drawImage(assets[type], x, y, tile_size, assets[type].height * tile_size / assets[type].width);
        } else if (tribe) {
            if (type === 'forest' || type === 'mountain') {
                canvas.drawImage(assets[tribe]['ground'], x, y, tile_size, assets[tribe]['ground'].height * tile_size / assets[tribe]['ground'].width);
                let lowering = tribe === 'Kickoo' && type === 'mountain' ? 0.82 : 0.52;
                canvas.drawImage(assets[tribe][type], x, y + lowering * tile_size - tile_size * assets[tribe][type].height / assets[tribe][type].width, tile_size, assets[tribe]['ground'].height * tile_size / assets[tribe]['ground'].width);
            } else if (type === 'water' || type === 'ocean') {
                canvas.drawImage(assets[tribe][type], x, y - 0.3 * tile_size, tile_size, assets[tribe][type].height * tile_size / assets[tribe][type].width);
            } else {
                canvas.drawImage(assets[tribe][type], x, y, tile_size, assets[tribe][type].height * tile_size / assets[tribe][type].width);
            }
        }

        function draw_above(image) {
            canvas.drawImage(image, x, y, tile_size, image.height * tile_size / image.width);
        }

        if (above === 'capital') {
            canvas.drawImage(assets[tribe]['capital'], x, y - 0.3 * tile_size, tile_size, assets[tribe]['capital'].height * tile_size / assets[tribe]['capital'].width);
        } else if (above === 'whale') {
            draw_above(assets['whale']);
        } else if (above === 'village') {
            draw_above(assets['village']);
        } else if (above === 'game') {
            draw_above(assets[tribe]['game']);
        } else if (above === 'fruit') {
            draw_above(assets[tribe]['fruit']);
        } else if (above === 'crop') {
            draw_above(assets['crop']);
        } else if (above === 'fish') {
            draw_above(assets['fish']);
        } else if (above === 'metal') {
            draw_above(assets['metal']);
        } else if (above === 'ruin') {
            draw_above(assets['ruin']);
        }
    }

}

function random_int(min, max) {
    let rand = min + Math.random() * (max - min);
    return Math.floor(rand);
}

function rand_array_element(arr) {
    return arr[Math.random() * arr.length | 0];
}

function circle(center, radius) {
    let circle = [];
    let row = center / map_size | 0;
    let column = center % map_size;
    let i = row - radius;
    if (i >= 0 && i < map_size) {
        for (let j = column - radius; j < column + radius; j++) {
            if (j >= 0 && j < map_size) {
                circle.push(i * map_size + j)
            }
        }
    }
    i = row + radius;
    if (i >= 0 && i < map_size) {
        for (let j = column + radius; j > column - radius; j--) {
            if (j >= 0 && j < map_size) {
                circle.push(i * map_size + j)
            }
        }
    }
    let j = column - radius;
    if (j >= 0 && j < map_size) {
        for (let i = row + radius; i > row - radius; i--) {
            if (i >= 0 && i < map_size) {
                circle.push(i * map_size + j)
            }
        }
    }
    j = column + radius;
    if (j >= 0 && j < map_size) {
        for (let i = row - radius; i < row + radius; i++) {
            if (i >= 0 && i < map_size) {
                circle.push(i * map_size + j)
            }
        }
    }
    return circle;
}

function round(center, radius) {
    let round = [];
    for (let r = 1; r <= radius; r++) {
        round = round.concat(circle(center, r));
    }
    round.push(center);
    return round;
}

function plus_sign(center) {
    let plus_sign = [];
    let row = center / map_size | 0;
    let column = center % map_size;
    if (column > 0) {
        plus_sign.push(center - 1);
    }
    if (column < map_size - 1) {
        plus_sign.push(center + 1);
    }
    if (row > 0) {
        plus_sign.push(center - map_size);
    }
    if (row < map_size - 1) {
        plus_sign.push(center + map_size);
    }
    return plus_sign;
}
