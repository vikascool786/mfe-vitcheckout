import FilterButton from "../FilterButton/FilterButton";
import "./FilterBox.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleDot,
  faSquare,
  faSquareCheck,
} from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { fixWidthBtn } from "../constants";

export default function FilterBox({
  contextFilter,
  prefixIcon,
  actionIcon,
  handleBack,
  handleClick,
  backBtn,
  handleClose,
  handleClear,
  handleSeeResults,
  isMainFilter,
}) {
  const hasSelectedContextFilter =
    contextFilter?.content?.some((c) => c.isSelected === true) ||
    contextFilter?.content?.some((con) =>
      con?.catContent?.some((c) => c.isSelected === true)
    );

  const isBtnEnabled = isMainFilter ? true : hasSelectedContextFilter;
  return (
    <>
      <div className="modal-overlay">
        <div className="qa-filter-box filter-container">
          <div className="filter-data-container">
            <div>
              <div className="filter-title-container">
                <div className="back-btn" onClick={handleBack}>
                  {backBtn}
                </div>
                <div className="filter-heading">
                  {prefixIcon} {contextFilter.title}
                </div>
                <div className="close-btn" onClick={handleClose}>
                  <FontAwesomeIcon icon={faXmark} />
                </div>
              </div>
              {contextFilter.title.toLowerCase() === "department" ? (
                <>
                  {contextFilter?.content &&
                    contextFilter.content.map((content, i) => (
                      <div key={i} className="dept-filter-content">
                        <div
                          className="qa-filter-item dept-filter-item"
                          onClick={() => handleClick(content)}
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: content.name }}
                          ></div>
                          <div>
                            {content.isSelected ? (
                              <FontAwesomeIcon icon={faCircleDot} />
                            ) : (
                              actionIcon
                            )}
                          </div>
                        </div>
                        <div>
                          {content.catContent.map((catCon, i) => (
                            <div
                              key={i}
                              className="qa-filter-item dept-filter-sub-item"
                              onClick={() => handleClick(catCon)}
                            >
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: catCon.name,
                                }}
                              ></div>
                              <div>
                                {catCon.isSelected ? (
                                  <FontAwesomeIcon icon={faCircleDot} />
                                ) : (
                                  actionIcon
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                <>
                  {contextFilter?.content &&
                    contextFilter.content.map((content, i) =>
                      content.type ? (
                        <div
                          key={i}
                          className="qa-filter-item filter-item"
                          onClick={() => handleClick(content)}
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: content.name }}
                            className="filter-content"
                          ></div>
                          <div>
                            {content.isSelected ? (
                              <FontAwesomeIcon icon={faSquareCheck} />
                            ) : (
                              <FontAwesomeIcon icon={faSquare} />
                            )}{" "}
                          </div>
                        </div>
                      ) : (
                        <div
                          key={i}
                          className="qa-filter-item filter-item"
                          onClick={() => handleClick(content)}
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: content.name }}
                            className="filter-content"
                          ></div>
                          <div>
                            {content.isSelected ? (
                              <FontAwesomeIcon icon={faCircleDot} />
                            ) : (
                              actionIcon
                            )}
                          </div>
                        </div>
                      )
                    )}
                </>
              )}
            </div>
          </div>
          <div className="filter-btns">
            {/* <FilterButton text="Clear All" btnStyle={fixWidthBtn} handleClick={handleClear} ></FilterButton> */}
            <FilterButton
              className="qa-see-results"
              text="See Results"
              btnStyle={fixWidthBtn}
              handleClick={(e) => handleSeeResults(e)}
              isDisabled={!isBtnEnabled}
            ></FilterButton>
          </div>
        </div>
      </div>
    </>
  );
}
