import type { ArchitectureElement, ArchitectureModel, ArchitectureView } from "../model";

export function getElementById(
  architecture: ArchitectureModel,
  elementId: string,
): ArchitectureElement | undefined {
  return architecture.elements.find((element) => element.id === elementId);
}

export function getChildren(
  architecture: ArchitectureModel,
  parentId: string,
): ArchitectureElement[] {
  return architecture.elements.filter((element) => element.parentId === parentId);
}

export function getViewById(
  architecture: ArchitectureModel,
  viewId: string,
): ArchitectureView | undefined {
  return architecture.views.find((view) => view.id === viewId);
}
