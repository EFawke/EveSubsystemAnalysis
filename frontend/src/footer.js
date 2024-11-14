import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-dark text-white mt-5">
            <div id = "footer_main" className="container py-4">
                <div className="row" id = "footer_row">
                    <div className="col-md-6">
                        <p className="text-muted">All EVE related materials are property of <a href="https://www.ccpgames.com/">CCP Games</a></p>
                        <ul className="list-unstyled">
                            <li><a href="/about" className="text-white">About</a></li>
                            <li><a href="/credits" className="text-white">Credits</a></li>
                            <li><a href="/github" className="text-white">GitHub</a></li>
                        </ul>
                    </div>
                    <div className="text-center pt-3">
                        <p className="mb-0">&copy; {new Date().getFullYear()} Please send ISK to <a href="https://zkillboard.com/character/2118801505/">Ziedia</a></p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
