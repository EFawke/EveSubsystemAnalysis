import { Heading } from "@radix-ui/themes";

function PageTitle({ pageTitle }) {
    return (
        <Heading mb="8" mt="8" size="6" weight="medium">{pageTitle}</Heading>
    )
}

export default PageTitle;