//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );


function callLeboncoin( url, sendData ) {


    request( url, function ( error, response, html ) {

        if ( !error && response.statusCode == 200 ) {



            var $ = cheerio.load( html )
            var lbcDataArray = $( 'section.properties span.value' )

            var P = parseInt( $( lbcDataArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 )
            var c = $( lbcDataArray.get( 1 ) ).text().trim().toLowerCase().replace( /\_|\s/g, '-' )
            var t = $( lbcDataArray.get( 2 ) ).text().trim().toLowerCase()
            var s = parseInt( $( lbcDataArray.get( 4 ) ).text().replace( /\s/g, '' ), 10 )

            var url2 = 'https://www.meilleursagents.com/prix-immobilier/' + c + '/'
            request( url2, function ( error, response, html2 ) {

                if ( !error && response.statusCode == 200 ) {

                    var $ = cheerio.load( html2 )

                    var lmaDataMatrix = $( '.prices-summary__values .row' )
                    var lmaRowF = $( lmaDataMatrix.get( 1 ) )

                    var lmaRowH = $( lmaDataMatrix.get( 2 ) )

                    var pa = ''

                    if ( t == 'appartement' ) {
                        pa = parseInt( $( lmaRowF.find( '.columns' ).get( 2 ) ).text().replace( /\s/g, '' ), 10 )
                    }
                    else {
                        pa = parseInt( $( lmaRowH.find( '.columns' ).get( 2 ) ).text().replace( /\s/g, '' ), 10 )
                    }

                    var mess = ''
                    var pps = ( P / s ) - ( ( P / s ) % 1 )
                    if ( pa < pps ) {
                        mess = "IT'S A GOOD DEAL !"
                    }
                    else {
                        mess = "IT'S NOT A GOOD DEAL AT ALL :( "
                    }



                    var Data = {
                        price: P,

                        city: c,

                        type: t,

                        surface: s,

                        priceComp: pa,

                        text: mess
                    }

                    sendData( Data )
                }
                else {

                    console.log( error )

                }
            })
        }

        else {

            console.log( error )

        }

    })

}



//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/', function ( req, res ) {

    res.render( 'home', {
        prix: '',
        ville: '',
        typeL: '',
        surface: '',
        prixComp: '',
        ccl: ''
    });
});

app.get( '/call', function ( req, res ) {
    var url = req.query.urlLBC

    callLeboncoin( url, function ( Data ) {
        res.render( 'home', {
            prix: Data.price,
            ville: Data.city,
            typeL: Data.type,
            surface: Data.surface,
            prixComp: Data.priceComp,
            ccl: Data.text
        })
    });
});

//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});