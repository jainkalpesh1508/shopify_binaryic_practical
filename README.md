# shopify_binaryic_practical

# Advanced AJAX Quick Shop – Shopify

## Overview

A fully functional AJAX Quick Shop built for a Shopify collection page using **Liquid, HTML, CSS, and Vanilla JavaScript**.

Users can view product details, select variants, change quantity, and add products to the cart without leaving or reloading the collection page.

## Features

* Dynamic product listing using Shopify Liquid
* Quick Shop modal without page reload
* Product image gallery
* Product title, price and compare-at price
* Dynamic product options and variant selection
* Support for products with different numbers of options
* Invalid/unavailable variant combinations are disabled
* Quantity selector
* AJAX Add to Cart
* Add to Cart loading and error handling
* Prevents duplicate Add to Cart clicks
* Cart count update
* Horizon cart drawer integration
* Cart quantity/remove functionality handled by Horizon
* Browser URL updates using `history.pushState()`
* Browser Back/Forward support
* Quick Shop opens automatically when refreshing a Quick Shop URL
* ESC and outside-click close
* Keyboard accessibility and focus handling
* Responsive design for desktop, tablet and mobile

## Technologies

* Shopify Liquid
* HTML5
* CSS3
* Vanilla JavaScript
* Shopify AJAX Cart API
* Shopify Section Rendering API
* Browser History API

## Shopify APIs Used

### Product Data

```text
/products/{product-handle}.js
```

Used to dynamically load product and variant information.

### Add to Cart

```text
POST /cart/add.js
```

Used to add the selected variant and quantity without reloading the page.

### Cart

```text
GET /cart.js
```

Used to get the latest cart information and update the cart count.

### Section Rendering

The Horizon cart drawer section is requested after adding a product so the cart drawer can display the latest cart contents.

## Variant Handling

The Quick Shop checks the selected options against available variants.

For example:

```text
Color: Pink
Size: L
```

If `Pink + XL` is unavailable, the XL option is automatically disabled while Pink is selected.

This prevents invalid combinations from being added to the cart.

## Browser History

Quick Shop URLs use the following format:

```text
/collections/shoes?quick_shop=product-handle
```

Supported:

* Open Quick Shop → URL updates
* Browser Back → Quick Shop closes
* Browser Forward → Quick Shop opens
* Refresh → Quick Shop opens automatically

## Responsive Design

The Quick Shop works on:

* Desktop
* Tablet
* Mobile

The mobile layout is optimized for smaller screens and touch interaction.

## Accessibility

Implemented:

* ESC to close
* Click outside to close
* Keyboard-accessible controls
* Focus management
* Focus restoration
* Loading states
* Error states

## Setup

1. Add the provided Liquid section/snippet to the Shopify theme.
2. Add the Quick Shop JavaScript and CSS files.
3. Add the Quick Shop trigger to the collection product cards.
4. Open any Shopify collection page.
5. Click **Quick Shop** on a product.

## Testing

Tested with:

* Single-option products
* Multiple-option products
* Unavailable variants
* Invalid variant combinations
* Different quantities
* Multiple Add to Cart operations
* Cart drawer updates
* Browser Back/Forward
* Quick Shop URL refresh
* Desktop, tablet and mobile layouts

## Restrictions Followed

No:

* Custom backend
* Shopify App
* Third-party Quick Shop library
* Third-party variant library
* Third-party cart library
* Hardcoded product or variant data

The implementation uses Shopify's native theme and AJAX APIs.
