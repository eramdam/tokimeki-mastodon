import { Block } from "./block";

export function Footer() {
  return (
    <Block className="w-full">
      <div className="custom-prose opacity-60">
        <FooterParagraph />
      </div>
    </Block>
  );
}

export function FooterParagraph() {
  return (
    <p className="!m-0">
      Based off{" "}
      <a href="https://tokimeki-unfollow.glitch.me/">Tokimeki Unfollow</a> by{" "}
      <a href="https://tarng.com/">Julius Tarng</a>.
      <br />
      Made by <a href="https://erambert.me">Damien Erambert</a>. Find me at{" "}
      <a href="https://social.erambert.me/@eramdam">eramdam@erambert.me</a>!
    </p>
  );
}
