// Assets are converted on build to base64 strings, so in Browser they can
// be used as variables, reducing request number.
const assets = {
    logo: require('url?once=1!../assets/logo.svg'),
    planejado: require('url?once=1!../assets/img/planejado.png'),
    empenhado: require('url?once=1!../assets/img/empenhado.png'),
    liquidado: require('url?once=1!../assets/img/liquidado.png'),
    patM: require('url?once=1!../assets/patM.png'),
    patNM: require('url?once=1!../assets/patNM.png'),
}

export default assets