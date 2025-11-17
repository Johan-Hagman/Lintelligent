import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectMenu } from "./SelectMenu";

const OPTIONS = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
];

describe("SelectMenu", () => {
  it("renders label and placeholder", () => {
    render(
      <SelectMenu
        label="Pick one"
        options={OPTIONS}
        value={null}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText("Pick one")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pick one/i })).toHaveTextContent(
      "Select an option"
    );
  });

  it("selects option via click", async () => {
    const handleChange = jest.fn();
    render(
      <SelectMenu
        label="Pick one"
        options={OPTIONS}
        value={null}
        onChange={handleChange}
      />
    );

    const trigger = screen.getByRole("button", { name: /pick one/i });
    await userEvent.click(trigger);
    const option = await screen.findByRole("option", {
      name: /option a/i,
    });
    await userEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith("a");
    expect(
      screen.queryByRole("option", { name: /option a/i })
    ).not.toBeInTheDocument();
  });

  it("prevents interaction when disabled", async () => {
    const handleChange = jest.fn();
    render(
      <SelectMenu
        label="Disabled"
        options={OPTIONS}
        value={null}
        onChange={handleChange}
        disabled
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /disabled/i }));
    expect(
      screen.queryByRole("option", { name: /option a/i })
    ).not.toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("renders empty state when no options", () => {
    render(
      <SelectMenu
        label="Empty"
        options={[]}
        value={null}
        onChange={jest.fn()}
        emptyMessage="Nothing here"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /empty/i }));
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});


