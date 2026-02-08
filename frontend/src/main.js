import header from "./components/header.js";
import footer from "./components/footer.js"


function Constructor() {

    return `
    ${header()}
    ${footer()}

    `
}


document.querySelector("#app").innerHTML = Constructor();
