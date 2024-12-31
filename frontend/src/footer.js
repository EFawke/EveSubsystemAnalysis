import React from 'react';
import { Section, Flex, Link, Heading, Text, Button, IconButton, Container } from "@radix-ui/themes";
import { GearIcon } from "@radix-ui/react-icons"

const Footer = () => {
    return (
        <Container size="4" style={{ background: "var(--gray-a2)", alignSelf: "end" }} mt="5">
            <Flex mt="5" mb="5" width="100%" justify="between" align="center">
                <Text>
                    All EVE related materials are property of <Link href="https://www.ccpgames.com/">CCP Games</Link>
                </Text>
            </Flex>
            <Flex mt="5" mb="5" width="100%" justify="between" align="center">
            <ul style={{ listStyleType: "none", padding: 0 }}>
                <li>
                    <Link href="/about">About</Link>
                </li>
                <li>
                    <Link href="/github">GitHub</Link>
                </li>
            </ul>
            </Flex>
        </Container>
        // <footer className="bg-dark text-white mt-5">
        //     <div id = "footer_main" className="container py-4">
        //         <div className="row" id = "footer_row">
        //             <div className="col-md-6">
        //                 <p className="text-muted">All EVE related materials are property of <a href="https://www.ccpgames.com/">CCP Games</a></p>
        //                 <ul className="list-unstyled">
        //                     <li><a href="/about" className="text-white">About</a></li>
        //                     <li><a href="/credits" className="text-white">Credits</a></li>
        //                     <li><a href="/github" className="text-white">GitHub</a></li>
        //                 </ul>
        //             </div>
        //             <div className="text-center pt-3">
        //                 <p className="mb-0">&copy; {new Date().getFullYear()} Please send ISK to <a href="https://zkillboard.com/character/2118801505/">Ziedia</a></p>
        //             </div>
        //         </div>
        //     </div>
        // </footer>
    );
}

export default Footer;
