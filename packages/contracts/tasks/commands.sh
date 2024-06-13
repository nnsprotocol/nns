yarn hardhat ignition deploy ./ignition/modules/NNS.ts --network localhost

yarn hardhat register-cld \
  --name "⌐◨-◨" \
  --communityreward 60 \
  --referralreward 10 \
  --pricingoracle 0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82 \
  --communitypayable 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --communitymanager 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --expiringnames false \
  --defaultcldresolver true \
  --splitsharecld true \
  --network localhost

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