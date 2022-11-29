# Buttonwood Protocol List

This is an implementation of a [Protocol List](https://github.com/buttonwood-protocol/protocol-lists), maintained by Buttonwood to service its dApps.

We encourage third parties that wish to create their own bonds or auctions and have users interact with them via Buttonwood dApps to follow the instructions below.

## Adding your protocol to this list

The follow guide is for adding a new protocol.
Updating an existing one is the same process, but with some steps done already.

1. Clone this repository
2. Run `yarn install`, ensuring you have node.js and yarn installed
3. Create a new "protocol definition" file
   - This is done by creating a JSON file in `src/protocolDefinitions/`, naming it after your protocol
   - eg. for PRL we have the corresponding `src/protocolDefinitions/prl.json`
4. Edit this new protocol definition file to supply the relevant information
   - See section below for more detail on the data structure used
   - Also refer to `src/protocol-definition.schema.json` - this is a JSON schema that describes a valid protocol definition
5. Run `yarn start` to attempt to rebuild the final protocol list
   - This will validate your new protocol definition against the schema
   - Correct any errors until the command successfully completes
   - The protocol list version will be updated automatically based on the changes made
6. Run `yarn test` to ensure the changes made pass the test suite
7. Run `yarn lint:fix` to ensure changes adhere to style rules
8. Commit changes to a new branch and open a pull request to merge them

## Protocol Definition structure

Here's an example:

```json
{
  "name": "PRL",
  "homepage": "https://www.prl.one/",
  "imageURI": "assets/protocols/prl/mascot.png",
  "chains": {
    "mainnet": {
      "auctionCreators": ["0xd7e86Bd77784217324b4E94AEDc68E5C8227EC2B"],
      "bondCreators": ["0xd7e86Bd77784217324b4E94AEDc68E5C8227EC2B"]
    },
    "goerli": {
      "auctionCreators": [
        "0xfD99d2d103b09F95c3dFc458F57178bF0CD587B1",
        "0xEDBcCA5DfD692bab7656Ab2D4F499B43fA26480B",
        "0xb1Cc73B1610863D51B5b8269b9162237e87679c3"
      ],
      "bondCreators": [
        "0xfD99d2d103b09F95c3dFc458F57178bF0CD587B1",
        "0xEDBcCA5DfD692bab7656Ab2D4F499B43fA26480B",
        "0xb1Cc73B1610863D51B5b8269b9162237e87679c3"
      ]
    }
  },
  "overrides": {
    "0xd7e86Bd77784217324b4E94AEDc68E5C8227EC2B": {
      "name": "PRL: Deployer"
    },
    "0xfD99d2d103b09F95c3dFc458F57178bF0CD587B1": {
      "name": "PRL Tester",
      "imageURI": "assets/protocols/prl/tester-avatar.png"
    }
  }
}
```

Stepping through this:

- Top level metadata
  - The unique name by which we recognise this protocol is "PRL"
  - We've specified the optional `homepage` property, which is a link to our website
  - We've specified the optional `imageURI` property, which points to a locally stored file in the `assets` subdirectory
- Core data in `chains`
  - This records the most important data - the addresses associated with the protocol
  - By including an address here, the author is claiming that the protocol has direct control over it - and thus that users can interact with auctions or bonds created by that address safely
  - The final protocol list references chains by their numerical ID, but to reduce the potential for error the protocol definition requires them to be specified by name
    - You can refer to the `src/getChainId.ts` file to check what chain names are currently handled
    - If a chain is required that isn't listed there, edit the file accordingly
  - In the example above, we've specified that PRL bond creators on goerli testnet can be any of three addresses, but on mainnet is instead just the `0xd7e86Bd77784217324b4E94AEDc68E5C8227EC2B` address
  - If `0xfD99d2d103b09F95c3dFc458F57178bF0CD587B1` created a bond on mainnet, it would not be recognised as being owned by PRL
- Overrides
  - By default, dApps use the to level metadata to display alongside a recognised address
  - The overrides data allows for customising these values on a per address basis
  - In the example above we've defined the address used on mainnet to have a different name ("PRL: Deployer") but it will still use the `imageURI` and `homepage` properties defined in the top level metadata
  - In contrast, one of the addresses listed for goerli has been given its own `imageURI` in addition to a custom name

## Assets

When specifying `imageURI` values you can use either a URI or a local path that is resolved from the root of this repository.
The latter is preferred, since allowing arbitrary third party URIs opens up the potential for someone to gather data on our users by tracking who loads an image from their server.
If you wish to use a URI anyway you will need to justify it to us during pull request review.

Assets should be kept within the `assets` folder, and for keeping things tidy, also placed within `/protocols/<protocol name>/` sub folder.

eg. for PRL, we have `/assets/protocols/prl/mascot.png` that we use as our protocol definition's top level `imageURI` property.

Images should not be excessive in size, and we prefer 256x256 pixel PNGs.
Other aspect ratios, resolutions and filetypes might work but have potential to cause visual defects when used by dApp clients.

The images stored in the assets folder are hosted at the same location as the Buttonwood protocol list, and the local paths in the protocol definitions are rewritten to be URIs during build.

## Pull requests

Once ready, a pull request that merges your branch into `main` should be opened.
It will need to pass the automated unit tests before we review it further.

There is a danger that attackers might impersonate a protocol, adding malicious addresses to this list.
As such, the repository maintainers that approve pull requests need to judge whether the authors are genuine.
This is not too challenging for protocols that the maintainers are already familiar and in contact with, but for other protocols some extra steps might be requested to give the necessary confidence.
