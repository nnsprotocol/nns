import React from "react";
import Accordion from "react-bootstrap/Accordion";

const FaqData = () => {
  return (
    <Accordion>
      <Accordion.Item eventKey={1} className="bg-transparent mt-2">
        <Accordion.Header className="bg-transparent">
          <h2 className=" fw_xetrabold font_root_bold font_md black mb-0">
            WTF is NNS?
          </h2>
        </Accordion.Header>
        <Accordion.Body className="ps-2 ms-1 pe-lg-5 py-0">
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            NNS stands for Nouns Name Service.{" "}
          </p>
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            It's an experimental naming infrastructure to connect communities
            spreading the nounish culture.{" "}
          </p>
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            Every .⌐◨-◨ name is a natural extension of your nounish identity.
          </p>
          <p className=" fw_normal font_root font_sm black">
            It will transform the ⌐◨-◨ from a simple icon to a fully functional
            TLD with a growing set of benefits and functions, for life.
          </p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey={2} className="bg-transparent mt-2">
        <Accordion.Header className="bg-transparent">
          <h2 className=" fw_xetrabold font_root_bold font_md black mb-0">
            Can I set the same address as primary on both NNS and ENS?
          </h2>
        </Accordion.Header>
        <Accordion.Body className="ps-2 ms-1 pe-lg-5 py-0">
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            Yes. There is no conflict between NNS and ENS.{" "}
          </p>
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            Being a new naming system, the NNS is currently natively supported
            only in the nouniverse and in some selected partners.
          </p>
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            If you choose to use the same primary address on both, your name
            will be resolved in its nounish version (.⌐◨-◨) inside the
            nouniverse, but it will stay in its classic version (.eth) outside
            of it.{" "}
          </p>
          <p className=" fw_normal font_root font_sm black">
            This way, it will be like having an ENS with nounish powers!{" "}
          </p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey={3} className="bg-transparent mt-2">
        <Accordion.Header className="bg-transparent">
          <h2 className=" fw_xetrabold font_root_bold font_md black mb-0">
            Why are all the numbers from 0 to 9999 reserved?{" "}
          </h2>
        </Accordion.Header>
        <Accordion.Body className="ps-2 ms-1 pe-lg-5 py-0">
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            Yes. There is no conflict between NNS and ENS.{" "}
          </p>
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            The numbers will be reserved for an exciting initiative called "The
            Nounish Club".
          </p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey={4} className="bg-transparent mt-2">
        <Accordion.Header className="bg-transparent">
          <h2 className=" fw_xetrabold font_root_bold font_md black mb-0">
            How can I use my .⌐◨-◨ name as my Ethereum wallet?{" "}
          </h2>
        </Accordion.Header>
        <Accordion.Body className="ps-2 ms-1 pe-lg-5 py-0">
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            Go on your dashboard and associate your nounish name to the wallet
            of your choice.{" "}
          </p>
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            You will see your name natively resolved on our nounish partners
            platforms.
          </p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey={5} className="bg-transparent mt-2">
        <Accordion.Header className="bg-transparent">
          <h2 className=" fw_xetrabold font_root_bold font_md black mb-0">
            When was the Main Net launched?
          </h2>
        </Accordion.Header>
        <Accordion.Body className="ps-2 ms-1 pe-lg-5 py-0">
          <p className=" fw_normal font_root font_sm opacity-7 text-black mb-1">
            The NNS Main Net was launched on July 28, 2022.
          </p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey={6} className="bg-transparent mt-2">
        <Accordion.Header className="bg-transparent">
          <h2 className=" fw_xetrabold font_root_bold font_md black mb-0">
            How much does it cost to register a .⌐◨-◨ name?{" "}
          </h2>
        </Accordion.Header>
        <Accordion.Body className="ps-2 ms-1 pe-lg-5 py-0">
          <p className="fw_normal font_root font_sm opacity-7 text-black mb-1">
            Prices are currently as follows:
          </p>
          <p className="fw_normal font_root font_sm opacity-7 text-black mb-1">
            4+ character .⌐◨-◨ names: $100 in ETH, one-time fee.{" "}
          </p>
          <p className="fw_normal font_root font_sm opacity-7 text-black mb-1">
            3 character .⌐◨-◨ names: $250 in ETH, one-time fee.{" "}
          </p>
          <p className="fw_normal font_root font_sm opacity-7 text-black mb-1">
            2 character .⌐◨-◨ names: $1000 in ETH, one-time fee.{" "}
          </p>
          <p className="fw_normal font_root font_sm opacity-7 text-black mb-1">
            1 character .⌐◨-◨ names: Coming soon.{" "}
          </p>
          <p className="fw_normal font_root font_sm opacity-7 text-black mb-1">
            The premium price for the names with a length below 4 characters has
            been applied to reflect their scarcity.{" "}
          </p>
        </Accordion.Body>
      </Accordion.Item>
     
    </Accordion>
  );
};

export default FaqData;
