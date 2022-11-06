export const rootClassName = "circular-slider";
export const holderClassNamePrefix = "holder-";

export default `
  .${rootClassName} {
    display: flex;
    align-items: center;
  }
  .${holderClassNamePrefix}legend {
    margin-right: 25px;
    text-align: right;
    font-size: 20px;
    font-family: sans-serif;
    font-weight: 500;
    min-width: 100px;
  }
  .${holderClassNamePrefix}legend * {
    vertical-align: middle;
  }
  .${holderClassNamePrefix}legend i {
    margin-left: 10px;
    display: inline-block;
    width: 15px;
    height: 15px;
    border: solid #bfbfbf 1px;
  }
`;