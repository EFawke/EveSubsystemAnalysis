import React from 'react';
import { Heading } from "@radix-ui/themes";

function PageTitle({ pageTitle }) {
    return (
        <Heading mb="6" mt="6" size="6" 
        // color="teal"
        >{pageTitle}</Heading>
    )
}

export default PageTitle;