# Menu photo prompts

Every picture in the app should look like it was taken on the same phone, on
the same counter, on the same night. That comes from keeping the style fixed
and changing only the food.

**Never edit blocks B and C.** Assemble a prompt as:

```
<block A for the item's family, with the item's clause substituted>

<block B — identical for every item>

<block C — identical for every item>
```

Feed the approved Farmhouse image back as a style/image reference for every
generation. That holds the set together better than wording alone.

---

## Block B — camera and light (never change)

```
Lit only from directly overhead by one bare warm tube light in a small
takeaway counter kitchen at night. A soft shadow falls across the bottom-left
of the food, and there is a little highlight glare on the wettest surface.
Shot on a phone: mild sensor noise, slightly flat under-saturated colour
straight out of the camera with no editing, the near edge sharpest and the far
edge slightly soft. Casual and unstyled, like the shop owner photographed an
order before it went out.
```

## Block C — framing (never change)

```
Square 1:1 framing. The food fills about 85% of the frame, centred, with a
small margin of the surface visible on all sides. No text, no logos, no hands,
no props, no plates or cutlery.
```

## Negative prompt (never change)

```
studio lighting, softbox, glossy advertising look, food styling, basil sprigs,
artful garnish, marble surface, rustic wooden board, dark moody restaurant
background, heavy bokeh, watermark, text, logo, brand name, hands, fork, knife,
plate, tilted horizon, vivid colours, saturated, HDR, halo, plastic-looking
cheese, perfectly symmetrical, cartoon, illustration, 3D render
```

---

## Block A1 — pizzas (30 items)

```
Overhead top-down photo of a freshly baked 9-inch <NAME> in an open brown
corrugated cardboard takeaway box, cut into 6 slices — one slice pulled
slightly away from the rest, leaving a visible gap and a smear of tomato sauce
on the cardboard beside it, with crumbs and a few flecks of burnt semolina
scattered around the base. Toppings: <CLAUSE> over melted mozzarella and
tomato sauce. Thin hand-stretched base, uneven golden-brown blistering on the
rim, a little darker along one edge, with a light sheen of oil and a few
browned cheese spots across the top.
```

### Veg pizzas

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `margherita.jpg` | Margherita pizza | nothing but melted mozzarella, with a light dusting of dried oregano |
| `single-topping.jpg` | Single Topping pizza | one topping only — rings of sliced onion, evenly spaced |
| `golden-corn.jpg` | Golden Corn pizza | sweet corn kernels scattered thickly |
| `veg-delight.jpg` | Veg Delight pizza | sliced onion, diced green capsicum and sweet corn |
| `love-bite.jpg` | Love Bite pizza | sliced mushroom and black olive rings |
| `veg-hawaiian.jpg` | Veg Hawaiian pizza | pineapple chunks, cubes of paneer and sweet corn |
| `farmhouse.jpg` | Farmhouse pizza | cubes of paneer with lightly charred edges, diced green capsicum and strips of red paprika |
| `azexotic-veggie.jpg` | Azexotic Veggie pizza | diced green capsicum, sliced mushroom, sweet corn and sliced onion |
| `veg-spicy.jpg` | Veg Spicy pizza | strips of red paprika, black olive rings, sliced green jalapeño and diced capsicum |
| `peri-peri-veg.jpg` | Peri Peri Veg pizza | sliced onion, green capsicum, mushroom, red and yellow bell pepper, sweet corn and tomato, dusted with red peri peri seasoning |
| `hot-n-spicy.jpg` | Hot & Spicy pizza | red and green bell peppers, sliced jalapeños, onion, cubes of chilli paneer and tomato |
| `magic-mushroom.jpg` | Magic Mushroom pizza | sliced mushroom, black olive rings and sliced onion |
| `makhani-paneer.jpg` | Makhani Paneer pizza | cubes of paneer, diced capsicum, onion and tomato on an orange makhni sauce instead of red tomato sauce |
| `mexican-veg.jpg` | Mexican Veg pizza | diced capsicum, sweet corn, sliced jalapeño and mushroom |
| `love-flames.jpg` | Love Flames pizza | cubes of paneer, sweet corn, black olives, capsicum, tomato and strips of red paprika |
| `overload-veg.jpg` | Overload pizza | every vegetable topping at once — paneer, capsicum, onion, sweet corn, mushroom, black olives, jalapeño and red paprika — piled thickly and unevenly |
| `house-special.jpg` | House Special pizza | every vegetable topping piled so thickly the cheese is barely visible between them |

### Non-veg pizzas

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `chicken-tikka-pizza.jpg` | Chicken Tikka pizza | chunks of charred chicken tikka, sliced onion and tomato |
| `hawaiian-chicken.jpg` | Hawaiian pizza | shredded roasted chicken, pineapple chunks, sliced onion and green capsicum |
| `peri-peri-chicken-pizza.jpg` | Peri Peri Chicken pizza | peri peri chicken pieces, diced green capsicum and red paprika chilli flakes |
| `spicy-chicken-pizza.jpg` | Spicy Chicken pizza | chicken pieces, sliced onion, green jalapeño rings and sweet corn |
| `bbq-chicken-pizza.jpg` | BBQ Chicken pizza | darkly glazed BBQ chicken pieces, sliced onion and green capsicum |
| `italian-chicken-pizza.jpg` | Italian Chicken pizza | sliced chicken sausage rounds, onion and green capsicum |
| `zesty-tremble-chicken.jpg` | Zesty Tremble Chicken pizza | barbeque chicken and spicy chicken pieces, strips of red paprika, black olive rings and sliced onion |
| `chicken-n-corn.jpg` | Chicken N Corn Delight pizza | chicken pieces, sweet corn and diced green capsicum |
| `chicken-pepperoni.jpg` | Chicken Pepperoni pizza | overlapping rounds of chicken pepperoni curled at the edges, diced green capsicum and red paprika |
| `chicken-supreme.jpg` | Chicken Supreme pizza | chicken pieces, chopped chicken ham, green capsicum and red paprika |
| `dynamite-chicken.jpg` | Dynamite Chicken pizza | strips of grilled chicken, diced capsicum and sliced mushroom |
| `chillie-chicken-pizza.jpg` | Chillie Chicken pizza | red and green bell peppers, sliced jalapeños, whole green chillies, onion and chicken pieces |
| `overload-nonveg.jpg` | Overload Non-Veg pizza | every topping at once — chicken tikka, pepperoni, sausage rounds, ham, capsicum, onion, olives and jalapeño — piled thickly and unevenly |

---

## Block A2 — food in a paper box, seen from above (36 items)

```
Overhead top-down photo of a portion of <NAME> in an open white paper
takeaway box on a dark counter, <CLAUSE>. A little of it has spilled over the
edge of the box, there is a grease mark on the paper, and a few crumbs are
scattered on the counter beside it.
```

### Fries

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `classic-fries.jpg` | classic fries | golden fries piled unevenly, some short and broken, lightly salted |
| `peri-peri-fries.jpg` | peri peri fries | golden fries dusted heavily with red peri peri seasoning that has collected in the corners of the box |
| `spl-cheese-fries.jpg` | cheese fries | golden fries under a thick pour of orange melted cheese sauce, still glossy |
| `baked-peri-peri-cheese-fries.jpg` | baked peri peri cheese fries | fries baked under browned melted cheese with red peri peri seasoning dusted over the top |

### Rolls and snacks

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `cheese-corn-roll.jpg` | cheese corn rolls | four golden crumb-fried cylinders, one broken open showing melted cheese and corn inside |
| `peri-peri-cheese-balls.jpg` | peri peri cheese balls | six round crumb-fried balls dusted with red seasoning, one split open with cheese pulling out |
| `veg-spring-roll.jpg` | veg spring rolls | four crisp golden spring rolls stacked at angles, one cut across to show the vegetable filling |
| `chicken-spring-roll.jpg` | chicken spring rolls | four crisp golden spring rolls, one cut across to show shredded chicken filling |

### Veg snacks

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `manchurian.jpg` | veg manchurian | dark brown fried balls in a thick glossy soy gravy, scattered with spring onion greens |
| `cheese-chilli.jpg` | chilli cheese | strips of fried cheese tossed with sliced onion and capsicum in a glossy dark sauce |
| `crispy-corn-salt-paper.jpg` | crispy corn salt and pepper | crisp fried corn kernels tossed with chopped spring onion and black pepper |
| `honey-chilli-potato.jpg` | honey chilli potato | crisp potato batons in a sticky red-brown glaze, scattered with sesame seeds |
| `garlic-cheese.jpg` | garlic cheese | fried cheese pieces tossed with chopped garlic and green chilli in a light glaze |

### Non-veg snacks

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `chilli-chicken-boneless.jpg` | boneless chilli chicken | boneless chicken pieces tossed with onion and capsicum in a glossy dark red sauce |
| `chilli-chicken-with-bone.jpg` | chilli chicken with bone | bone-in chicken pieces in a glossy dark red sauce with onion and green chilli |
| `lemon-chicken.jpg` | lemon chicken | fried chicken pieces in a pale yellow glaze with a squeezed lemon wedge in the box |
| `crispy-chicken-honey.jpg` | crispy chicken in honey sauce | crisp fried chicken pieces in a sticky amber glaze, scattered with sesame seeds |
| `chicken-manchurian.jpg` | chicken manchurian | dark fried chicken balls in a thick glossy soy gravy with spring onion greens |
| `chicken-lollipop.jpg` | chicken lollipops | six frenched chicken drumettes coated in dark red masala, bones pointing outward |

### Fried chicken

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `chicken-popcorn.jpg` | chicken popcorn | small crisp golden nuggets piled loosely, coating visibly craggy |
| `chicken-strips.jpg` | chicken strips | five long crumb-fried strips laid side by side, coating rough and golden |
| `drumstick-chicken.jpg` | fried chicken drumsticks | four crisp golden drumsticks, craggy coating, bones pointing outward |
| `american-chicken.jpg` | fried chicken pieces | a mix of crisp golden fried chicken pieces piled together, coating thick and craggy |
| `peri-peri-chicken-strips.jpg` | peri peri chicken strips | five crumb-fried strips dusted heavily with red peri peri seasoning |
| `bbq-chicken-strips.jpg` | BBQ chicken strips | five crumb-fried strips glazed dark and sticky with barbecue sauce |
| `peri-peri-chicken-wings.jpg` | peri peri chicken wings | six wings dusted red with peri peri seasoning, skin crisp and blistered |
| `bbq-chicken-wings.jpg` | BBQ chicken wings | six wings glazed dark and sticky with barbecue sauce, glossy under the light |

### Pasta

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `arabita-pasta.jpg` | arrabbiata pasta | penne coated in a red sauce flecked with chilli and herbs |
| `alfredo-pasta.jpg` | alfredo pasta | penne in a thick white cream sauce, a little pooled at one side |
| `makhni-pasta.jpg` | makhni pasta | penne in a rich orange makhni sauce |
| `mix-sauce-pasta.jpg` | mixed sauce pasta | penne half in red sauce and half in white cream sauce, swirled together where they meet |

### Noodles

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `noodles.jpg` | vegetable noodles | pale noodles tangled with shredded cabbage, carrot and spring onion |
| `hakka-noodles.jpg` | hakka noodles | brown-tossed noodles with shredded vegetables, a few strands hanging over the box edge |
| `chilli-garlic-noodles.jpg` | chilli garlic noodles | noodles tossed dark red with chilli and chopped garlic, glistening with oil |

---

## Block A3 — handheld food at an angle (19 items)

```
Photo from a slightly raised 30-degree angle of a <NAME> resting on a square
of crumpled butter paper on a dark counter, <CLAUSE>. The paper is creased and
lightly stained where the food sits.
```

### Burgers

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `aalu-patty-burger.jpg` | aloo patty burger | a thick spiced potato patty with shredded cabbage and green chutney in a soft toasted bun, the top bun sitting slightly askew |
| `veggie-cheese-burger.jpg` | veg cheese burger | a fried veg patty under a slice of half-melted cheese with onion and lettuce |
| `mushroom-cheese-burger.jpg` | mushroom cheese burger | sautéed mushrooms and melted cheese spilling slightly from the side of the bun |
| `crunchy-cheese-burger.jpg` | crunchy cheese burger | a crumb-fried patty with a visibly rough golden coating and melted cheese |
| `chicken-burger.jpg` | chicken burger | a grilled chicken patty with lettuce and a line of mayonnaise squeezing out at one side |
| `crunchy-chicken-burger.jpg` | crunchy chicken burger | a thick crumb-fried chicken patty, coating rough and golden, mayonnaise squeezing out at one side |

### Sandwiches — all grilled and cut into two triangles

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `veg-sandwich.jpg` | grilled veg sandwich | cut into two triangles and leaning against each other, dark grill lines across the top, sliced vegetables visible at the cut edge |
| `mushroom-cheese-sandwich.jpg` | grilled mushroom cheese sandwich | cut into two triangles, melted cheese and sautéed mushroom pulling apart at the cut edge |
| `chicken-makhnee-sandwich.jpg` | grilled chicken makhani sandwich | cut into two triangles, orange makhani chicken filling visible at the cut edge |
| `paneer-tikka-sandwich.jpg` | grilled paneer tikka sandwich | cut into two triangles, spiced orange paneer cubes visible at the cut edge |
| `chicken-tikka-sandwich.jpg` | grilled chicken tikka sandwich | cut into two triangles, charred chicken tikka pieces visible at the cut edge |
| `chicken-sandwich.jpg` | grilled chicken sandwich | cut into two triangles, shredded chicken and mayonnaise visible at the cut edge |
| `jammu-masala-sandwich.jpg` | grilled masala sandwich | cut into two triangles, spiced potato masala filling visible at the cut edge |
| `veg-spl-sandwich.jpg` | grilled special veg sandwich | cut into two triangles, stacked thick with vegetables and cheese in three layers of bread |
| `nonveg-spl-sandwich.jpg` | grilled special chicken sandwich | cut into two triangles, stacked thick with chicken and cheese in three layers of bread |
| `house-masala-sandwich.jpg` | grilled special masala sandwich | cut into two triangles, stacked thick with spiced masala filling and cheese |

### Wrap and combos

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `wrap.jpg` | rolled wrap | half-unwrapped from its paper, cut across one end to show the filling of spiced vegetables and onion |
| `burger-combo.jpg` | burger with fries and a cold drink | the burger on butter paper with an open paper box of fries beside it and a chilled unlabelled dark drink bottle behind, all crowded together on the counter |
| `crunchy-burger-combo.jpg` | crunchy burger with fries and a cold drink | the crumb-fried burger on butter paper with an open paper box of fries beside it and a chilled unlabelled dark drink bottle behind |

---

## Block A4 — shakes (11 items)

```
Photo from a slightly raised 30-degree angle of a <NAME> in a tall plain glass
on a dark counter, <CLAUSE>. Condensation runs down the outside of the glass
and there is a small ring of moisture on the counter beneath it.
```

| file | `<NAME>` | `<CLAUSE>` |
|---|---|---|
| `vanilla-shake.jpg` | vanilla shake | thick and pale cream coloured, with a soft head of foam at the top |
| `pineapple-shake.jpg` | pineapple shake | pale yellow and thick, foam settling at the rim |
| `strawberry-shake.jpg` | strawberry shake | soft pink and thick, a little foam clinging to the inside of the glass |
| `blueberry-shake.jpg` | blueberry shake | deep purple-blue and thick, paler foam at the top |
| `chocolate-shake.jpg` | chocolate shake | dark brown and thick, with a smear of chocolate syrup down the inside of the glass |
| `oreo-shake.jpg` | Oreo cookie shake | grey-brown and thick, flecked with dark cookie crumbs, more crumbs sprinkled on the foam |
| `kitkat-shake.jpg` | chocolate wafer shake | milky brown and thick, with crushed wafer pieces on the foam |
| `mango-shake.jpg` | mango shake | deep golden yellow and thick, foam settling at the rim |
| `cold-coffee.jpg` | cold coffee | dark caramel brown with a pale foam head, a few ice cubes visible |
| `butterscotch-shake.jpg` | butterscotch shake | pale golden and thick, with a caramel drizzle across the foam |
| `black-currant-shake.jpg` | black currant shake | deep purple and thick, paler foam at the top |

---

## Cold drinks — do not generate these (5 items)

`mineral-water.jpg` · `coke-750.jpg` · `thumbs-up-750.jpg` · `sprite-750.jpg` ·
`mazza-600.jpg`

These are branded bottles. An image model will produce a mangled imitation of
the Coca-Cola or Maaza label, which looks obviously fake at any size and puts
a counterfeit trademark in the app. Photograph the real bottles on the counter
instead — it takes a minute for all five — or leave them on the drawn art,
which is honest and looks fine.

---

## Before uploading

- Does it look like what the kitchen actually hands over? Crust thickness, box
  colour, portion size. Customers compare the photo with the box in their hands.
- Check it at thumbnail size, not full size. It renders at 62 px in the menu
  list and 104 px on Home. Silhouette and colour contrast are what carry.
- Upload via **Menu & stock → tap the thumbnail**. Any size is fine; the app
  crops square and shrinks it before upload.
