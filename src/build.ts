import { writeFile } from 'fs/promises';
import { getProtocolList } from './getProtocolList';
import { getProtocols } from './getProtocols';

async function build(): Promise<void> {
    const protocols = await getProtocols();

    const protocolList = getProtocolList(
        {
            name: 'Buttonwood',
            keywords: ['buttonwood', 'defi'],
        },
        protocols,
    );

    await writeFile(
        './buttonwood.protocol-list.json',
        JSON.stringify(protocolList, null, 2),
        'utf8',
    );
}

build().catch(console.error);
