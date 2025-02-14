import React from 'react';
import { Flex, Link, Text, Container } from "@radix-ui/themes";

const Footer = () => {
    return (
        <Container className="mobile_padding" size="4" style={{ background: "var(--gray-a2)", alignSelf: "end", width: "100%" }} mt="5">
            <Flex mt="5" mb="5" width="100%" justify="between" align="center">
                <Text>
                    All EVE related materials are property of <Link href="https://www.ccpgames.com/">CCP Games</Link>
                </Text>
            </Flex>
            <Flex direction="column" gap="2" mt="5" mb="5" width="100%" justify="between" align="start">
                <Link href="/">Home</Link>
                <Link href="/build">Build</Link>
                <Link href="/about">About</Link>
                {/* <Link href="/github">GitHub</Link> */}
            </Flex>
        </Container>
    );
}

export default Footer;
