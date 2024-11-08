import "./FilterButton.scss";

export default function FilterButton({
  text,
  prefixIcon,
  suffixIcon,
  handleSuffixIconClick,
  btnStyle,
  handleClick,
  isDisabled = false,
  sortValue,
  className = ""
}) {
  return (
    <button
      disabled={isDisabled}
      style={btnStyle}
      className={`${className} filter-btn`}
      onClick={handleClick}
    >
      {prefixIcon && <span className="prefix-icon-btn">{prefixIcon}</span>}
      <span
        className="btn-text"
        dangerouslySetInnerHTML={{ __html: text }}
      ></span>
      {sortValue && <span className="sort-value">{sortValue}</span>}
      {suffixIcon && (
        <span className="suffix-icon-btn" onClick={handleSuffixIconClick}>
          {suffixIcon}
        </span>
      )}
    </button>
  );
}
