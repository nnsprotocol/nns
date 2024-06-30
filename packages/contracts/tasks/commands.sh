yarn hardhat ignition deploy ./ignition/modules/NNS.ts --network localhost

yarn hardhat register-cld \
  --name "nouns" \
  --communityreward 80 \
  --referralreward 5 \
  --pricingoracle 0xC38eDEeC7b975F8EceEd8d2d58A9010aC1e1c221 \
  --communitypayable 0x543D53d6f6d15adB6B6c54ce2C4c28a5f2cCb036 \
  --communitymanager 0x543D53d6f6d15adB6B6c54ce2C4c28a5f2cCb036 \
  --expiringnames false \
  --defaultcldresolver true \
  --splitsharecld true \
  --network base-sepolia

yarn hardhat register-name \
  --name "dom" \
  --cld "⌐◨-◨" \
  --withreverse true \
  --network localhost

yarn hardhat set-reverse \
  --cld "⌐◨-◨" \
  --address "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" \
  --name "dom" \
  --network localhost

yarn hardhat delete-reverse \
  --cld "⌐◨-◨" \
  --address "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" \
  --network localhost