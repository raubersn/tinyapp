# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). In essence, a URL Shortener is a service that takes a regular URL and transforms it into an encoded version, which redirects back to the original URL.


## Final Product

!["screenshot of URLs page"](https://github.com/raubersn/tinyapp/blob/main/docs/list-url.jpg)
!["screenshot of creating a short URL"](https://github.com/raubersn/tinyapp/blob/main/docs/new-url.jpg)
!["screenshot of editing a short URL"](https://github.com/raubersn/tinyapp/blob/main/docs/edit-url.jpg)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## RESTful API (Stretch)

TinyApp implements a RESTful API following the routing conventions:

#### GET /urls

- Retrieves the collection of URLs to the logged in user.
- Renders a representation of the collection

#### POST /urls

- Creates a new URL using the provided request body
- Redirects to a route where the new URL can be viewed

#### GET /urls/:id

- Retrieves the URL with the specified id
- Renders a representation of the URL
- Responds with a 404 - Not Found error if the URL doesn't exist

#### PUT /urls/:id

- Updates a specific URL using the provided request body
- Redirects to a route where the updated URL can be viewed
- Responds with a 404 - Not Found error if the User doesn't exist

#### DELETE /urls/:id

- Deletes a specific URL
- Redirect to the index of the collection
- Responds with a 404 - Not Found error if the User doesn't exist